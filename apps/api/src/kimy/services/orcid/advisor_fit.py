"""Advisor-fit scoring.

Compares the embedding of a submission's title against every publication an
advisor has imported from ORCID, using pgvector cosine distance. The "fit
score" is the highest cosine similarity found; below ``orcid_advisor_fit_threshold``
we flag the assignment for coordinator review.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import bindparam, select
from sqlalchemy.ext.asyncio import AsyncSession

from kimy.core.config import get_settings
from kimy.models.orcid_publication import OWNER_TYPE_ADVISOR, OrcidPublication
from kimy.models.submission import Submission
from kimy.services.plagiarism.embedder import embed_texts

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class FitResult:
    score: float                # best cosine similarity in [0, 1] (clipped)
    alert: bool                 # True when score < threshold
    closest_publication_title: str | None
    publications_checked: int


async def compute_fit(
    session: AsyncSession,
    *,
    submission_id: UUID,
    advisor_id: UUID,
) -> FitResult | None:
    """Score `submission_id` against `advisor_id`'s publications.

    Returns None when the advisor has no publications imported (we can't judge
    fit without data, and forcing an alert would be misleading).
    """
    submission = await session.get(Submission, submission_id)
    if submission is None:
        return None

    title = submission.title.strip()
    if not title:
        return None

    query_text = title
    if submission.chapter:
        query_text = f"{title} — {submission.chapter}"

    embeddings, _backend = embed_texts([query_text])
    query_vec = embeddings[0]

    # Use pgvector's cosine distance (<=>). similarity = 1 - distance, clipped.
    stmt = (
        select(
            OrcidPublication.id,
            OrcidPublication.title,
            (1 - OrcidPublication.embedding.cosine_distance(
                bindparam("query_vec", value=query_vec)
            )).label("similarity"),
        )
        .where(
            OrcidPublication.owner_id == advisor_id,
            OrcidPublication.owner_type == OWNER_TYPE_ADVISOR,
        )
        .order_by("similarity")  # ascending — pull worst first then we'll just pick best
    )
    rows = list((await session.execute(stmt)).all())
    if not rows:
        return None

    best = max(rows, key=lambda r: r.similarity or 0.0)
    score = max(0.0, min(1.0, float(best.similarity or 0.0)))

    threshold = get_settings().orcid_advisor_fit_threshold
    return FitResult(
        score=score,
        alert=score < threshold,
        closest_publication_title=best.title,
        publications_checked=len(rows),
    )


async def update_submission_fit(
    session: AsyncSession,
    *,
    submission_id: UUID,
    advisor_id: UUID | None,
) -> FitResult | None:
    """Recompute and persist fit fields on `submissions`."""
    submission = await session.get(Submission, submission_id)
    if submission is None:
        return None

    if advisor_id is None:
        submission.advisor_fit_score = None
        submission.advisor_fit_alert = False
        await session.commit()
        return None

    fit = await compute_fit(session, submission_id=submission_id, advisor_id=advisor_id)
    if fit is None:
        # Advisor without ORCID linkage — keep score null but don't alert.
        submission.advisor_fit_score = None
        submission.advisor_fit_alert = False
    else:
        submission.advisor_fit_score = fit.score
        submission.advisor_fit_alert = fit.alert
    await session.commit()
    return fit


async def update_submissions_fit_bulk(
    session: AsyncSession,
    *,
    submissions: list[Submission],
    advisor_id: UUID | None,
) -> dict[UUID, FitResult | None]:
    """Batch counterpart of :func:`update_submission_fit`.

    Single advisor → reuse the publication query and the embedding pass for
    every submission. Returns a map ``submission_id -> FitResult | None`` so
    callers can build per-row outcomes. Persists fields on the passed
    Submission instances and commits once.
    """
    if not submissions:
        return {}

    if advisor_id is None:
        for s in submissions:
            s.advisor_fit_score = None
            s.advisor_fit_alert = False
        await session.commit()
        return {s.id: None for s in submissions}

    # 1. One query for advisor publications (id, title, embedding).
    pubs_stmt = (
        select(
            OrcidPublication.id,
            OrcidPublication.title,
            OrcidPublication.embedding,
        ).where(
            OrcidPublication.owner_id == advisor_id,
            OrcidPublication.owner_type == OWNER_TYPE_ADVISOR,
        )
    )
    pubs = list((await session.execute(pubs_stmt)).all())

    # 2. Build the query texts (title or "title — chapter").
    query_texts: list[str] = []
    for s in submissions:
        t = (s.title or "").strip()
        if not t:
            query_texts.append("")
            continue
        query_texts.append(f"{t} — {s.chapter}" if s.chapter else t)

    # 3. Embed every query text in one synchronous batch (CPU-bound — push to a
    #    thread so we don't stall the loop).
    embeddings, _backend = await asyncio.to_thread(embed_texts, query_texts)

    threshold = get_settings().orcid_advisor_fit_threshold
    results: dict[UUID, FitResult | None] = {}

    # 4. If the advisor has no publications at all the answer is the same for
    #    everyone: keep score null, don't alert.
    if not pubs:
        for s in submissions:
            s.advisor_fit_score = None
            s.advisor_fit_alert = False
            results[s.id] = None
        await session.commit()
        return results

    # 5. Cosine similarity in Python — embeddings are L2-normalized so cosine
    #    == dot product. For typical advisor footprints (<50 publications) this
    #    is faster than going to the DB N times.
    for s, query_vec, raw_text in zip(submissions, embeddings, query_texts, strict=True):
        if not raw_text:
            s.advisor_fit_score = None
            s.advisor_fit_alert = False
            results[s.id] = None
            continue

        best_pub_title: str | None = None
        best_similarity = -1.0
        for _pub_id, pub_title, pub_vec in pubs:
            # pub_vec may come back as numpy.ndarray (pgvector) or list[float].
            sim = float(sum(a * b for a, b in zip(query_vec, pub_vec, strict=False)))
            if sim > best_similarity:
                best_similarity = sim
                best_pub_title = pub_title

        score = max(0.0, min(1.0, best_similarity))
        fit = FitResult(
            score=score,
            alert=score < threshold,
            closest_publication_title=best_pub_title,
            publications_checked=len(pubs),
        )
        s.advisor_fit_score = fit.score
        s.advisor_fit_alert = fit.alert
        results[s.id] = fit

    await session.commit()
    return results
