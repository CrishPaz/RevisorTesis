"""Intra-program plagiarism scanner.

Public entry point: ``scan_version`` — embeds every chunk of a given version,
persists chunks + embeddings, and runs a cosine-similarity search against
chunks from OTHER submissions in the same academic program. Matches above the
threshold are persisted in `plagiarism_matches` for advisor review.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from kimy.models.document_chunk import DocumentChunk
from kimy.models.plagiarism_match import (
    PlagiarismMatch,
    PlagiarismSource,
    PlagiarismStatus,
)
from kimy.models.submission import Submission
from kimy.models.submission_version import SubmissionVersion
from kimy.services import storage
from kimy.services.documents.extractor import extract
from kimy.services.plagiarism.chunker import chunk_document
from kimy.services.plagiarism.embedder import embed_texts

logger = logging.getLogger(__name__)


SIMILARITY_THRESHOLD = 0.85
"""Above this cosine similarity a chunk pair is reported as a potential match."""

# pgvector exposes cosine *distance* via the `<=>` operator (1 - similarity),
# so threshold_distance = 1 - SIMILARITY_THRESHOLD.
COSINE_DISTANCE_THRESHOLD = 1 - SIMILARITY_THRESHOLD


@dataclass(slots=True)
class MatchSummary:
    matched_version_id: UUID
    matched_student_name: str
    matched_submission_title: str
    best_similarity: float
    chunk_count: int


async def scan_version(
    session: AsyncSession, version_id: UUID
) -> tuple[list[MatchSummary], str]:
    """Scan a version against the rest of its program. Returns (summaries, embedder_name)."""
    version = await session.get(SubmissionVersion, version_id)
    if version is None:
        logger.warning("plagiarism: version %s not found", version_id)
        return [], "none"

    submission = await session.get(Submission, version.submission_id)
    if submission is None:
        return [], "none"

    # 1. Extract text and chunk it. Document extraction + chunking are CPU-bound
    # and blocking; offload to the default thread pool so we don't stall the
    # event loop.
    path = storage.resolve(version.storage_path)
    if not path.is_file():
        logger.warning("plagiarism: file missing for version %s", version_id)
        return [], "none"

    def _extract_and_chunk() -> list[Any]:
        raw = path.read_bytes()
        ext = extract(version.original_filename, raw, version.mime_type)
        return chunk_document(ext)

    chunks = await asyncio.to_thread(_extract_and_chunk)
    if not chunks:
        logger.info("plagiarism: no chunks produced for version %s", version_id)
        return [], "none"

    # 2. Embed. The hashed-BoW embedder is pure-CPU and synchronous; push it
    # to a thread so a long document doesn't block the loop.
    vectors, embedder_name = await asyncio.to_thread(
        embed_texts, [c.text for c in chunks]
    )

    # 3. Wipe any prior chunks for idempotency, then persist new ones
    await session.execute(
        delete(DocumentChunk).where(DocumentChunk.version_id == version_id)
    )
    await session.execute(
        delete(PlagiarismMatch).where(PlagiarismMatch.version_id == version_id)
    )
    await session.flush()

    persisted_chunks: list[DocumentChunk] = []
    for chunk, vec in zip(chunks, vectors, strict=False):
        row = DocumentChunk(
            version_id=version_id,
            chunk_index=chunk.chunk_index,
            section=chunk.section,
            text=chunk.text,
            char_count=chunk.char_count,
            embedding=vec,
        )
        session.add(row)
        persisted_chunks.append(row)
    await session.flush()

    # 4. Cosine search against chunks from OTHER submissions in the same program.
    # Single batched query with LATERAL JOIN: for each source chunk we get its
    # top-3 nearest neighbors above the similarity threshold in ONE round-trip,
    # leveraging the pgvector index per LATERAL iteration. Previously we ran one
    # query per source chunk (N+1 with N = number of chunks per document).
    source_ids = [c.id for c in persisted_chunks]
    matches_by_version: dict[UUID, list[PlagiarismMatch]] = {}

    if source_ids:
        lateral_sql = text(
            """
            SELECT
                s.id AS source_id,
                c.id AS matched_id,
                c.version_id AS matched_version_id,
                c.distance AS distance
            FROM document_chunks s
            CROSS JOIN LATERAL (
                SELECT dc.id, dc.version_id,
                       dc.embedding <=> s.embedding AS distance
                FROM document_chunks dc
                JOIN submission_versions sv ON sv.id = dc.version_id
                JOIN submissions sub ON sub.id = sv.submission_id
                WHERE sub.program_id = :program_id
                  AND sub.id <> :submission_id
                  AND dc.embedding <=> s.embedding <= :threshold
                ORDER BY dc.embedding <=> s.embedding
                LIMIT 3
            ) c
            WHERE s.id = ANY(:source_ids)
            """
        )
        result = await session.execute(
            lateral_sql,
            {
                "program_id": submission.program_id,
                "submission_id": submission.id,
                "threshold": COSINE_DISTANCE_THRESHOLD,
                "source_ids": source_ids,
            },
        )
        for row in result.all():
            similarity = float(1 - row.distance)
            match = PlagiarismMatch(
                version_id=version_id,
                matched_version_id=row.matched_version_id,
                source_chunk_id=row.source_id,
                matched_chunk_id=row.matched_id,
                similarity=similarity,
                source=PlagiarismSource.intra,
                status=PlagiarismStatus.pending,
            )
            session.add(match)
            matches_by_version.setdefault(row.matched_version_id, []).append(match)

    await session.commit()

    if not matches_by_version:
        return [], embedder_name

    # 5. Build per-other-submission summaries with metadata. Batched: one query
    # loads every matched version with its submission + student eagerly.
    summaries: list[MatchSummary] = []
    matched_vids = list(matches_by_version.keys())
    stmt = (
        select(SubmissionVersion)
        .options(
            selectinload(SubmissionVersion.submission).selectinload(
                Submission.student
            )
        )
        .where(SubmissionVersion.id.in_(matched_vids))
    )
    matched_versions = (await session.execute(stmt)).scalars().all()
    for other_version in matched_versions:
        other_submission = other_version.submission
        if other_submission is None or other_submission.student is None:
            continue
        group = matches_by_version[other_version.id]
        best = max(m.similarity for m in group)
        summaries.append(
            MatchSummary(
                matched_version_id=other_version.id,
                matched_student_name=other_submission.student.full_name,
                matched_submission_title=other_submission.title,
                best_similarity=best,
                chunk_count=len(group),
            )
        )

    return summaries, embedder_name


async def list_matches_for_version(
    session: AsyncSession,
    version_id: UUID,
    *,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """Return matches grouped by matched_version with chunk-level detail.

    The shape is designed for the API response (router-side mapping is trivial).
    `limit` is capped server-side to keep response sizes predictable.
    """
    safe_limit = max(1, min(limit, 500))
    safe_offset = max(0, offset)
    stmt = (
        select(PlagiarismMatch)
        .options(
            selectinload(PlagiarismMatch.source_chunk),
            selectinload(PlagiarismMatch.matched_chunk),
            selectinload(PlagiarismMatch.matched_version)
            .selectinload(SubmissionVersion.submission)
            .selectinload(Submission.student),
        )
        .where(PlagiarismMatch.version_id == version_id)
        .order_by(PlagiarismMatch.similarity.desc())
        .limit(safe_limit)
        .offset(safe_offset)
    )
    return list((await session.execute(stmt)).scalars().all())
