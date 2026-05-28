"""Cheap activity feed for the coordinator dashboard.

We don't have an explicit events table yet — instead we synthesize an activity
stream by UNIONing a few recent rows from the existing tables. Switch to a
proper event log if/when the load justifies it (Phase 12+).

The three source queries are independent, so we fan them out in parallel, each
on its own session (asyncpg sessions can't multiplex).
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from kimy.db.session import AsyncSessionLocal
from kimy.models.ai_evaluation import AIEvaluation
from kimy.models.submission import Submission
from kimy.models.submission_version import SubmissionVersion


@dataclass(slots=True)
class ActivityItem:
    kind: str                   # submission_created | version_uploaded | evaluation_completed
    occurred_at: datetime
    submission_id: str
    submission_title: str
    actor_name: str
    description: str


async def _recent_submissions(
    program_id: UUID | None, limit: int
) -> list[ActivityItem]:
    stmt = (
        select(Submission)
        .options(selectinload(Submission.student))
        .order_by(Submission.created_at.desc())
        .limit(limit)
    )
    if program_id is not None:
        stmt = stmt.where(Submission.program_id == program_id)
    async with AsyncSessionLocal() as session:
        rows = list((await session.execute(stmt)).scalars().all())
        return [
            ActivityItem(
                kind="submission_created",
                occurred_at=s.created_at,
                submission_id=str(s.id),
                submission_title=s.title,
                actor_name=s.student.full_name if s.student else "—",
                description=(
                    f"Nuevo avance creado por "
                    f"{s.student.full_name if s.student else 'estudiante'}"
                ),
            )
            for s in rows
        ]


async def _recent_versions(
    program_id: UUID | None, limit: int
) -> list[ActivityItem]:
    stmt = (
        select(SubmissionVersion, Submission)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
        .options(selectinload(Submission.student))
        .order_by(SubmissionVersion.created_at.desc())
        .limit(limit)
    )
    if program_id is not None:
        stmt = stmt.where(Submission.program_id == program_id)
    async with AsyncSessionLocal() as session:
        rows = list((await session.execute(stmt)).all())
        return [
            ActivityItem(
                kind="version_uploaded",
                occurred_at=v.created_at,
                submission_id=str(s.id),
                submission_title=s.title,
                actor_name=s.student.full_name if s.student else "—",
                description=(
                    f"Versión v{v.version_number} subida — {v.parsing_status.value}"
                ),
            )
            for v, s in rows
        ]


async def _recent_evaluations(
    program_id: UUID | None, limit: int
) -> list[ActivityItem]:
    stmt = (
        select(AIEvaluation, Submission)
        .join(SubmissionVersion, SubmissionVersion.id == AIEvaluation.version_id)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
        .options(selectinload(Submission.student))
        .order_by(AIEvaluation.created_at.desc())
        .limit(limit)
    )
    if program_id is not None:
        stmt = stmt.where(Submission.program_id == program_id)
    async with AsyncSessionLocal() as session:
        rows = list((await session.execute(stmt)).all())
        return [
            ActivityItem(
                kind="evaluation_completed",
                occurred_at=ev.created_at,
                submission_id=str(s.id),
                submission_title=s.title,
                actor_name=f"Tesis ({ev.backend})",
                description=(
                    f"Evaluación IA completada — {ev.total_percentage:.0f}% / "
                    f"{ev.decimal_grade:.1f}/20"
                ),
            )
            for ev, s in rows
        ]


async def recent(
    session: AsyncSession, *, program_id: UUID | None = None, limit: int = 15
) -> list[ActivityItem]:
    """Fan out the three source feeds in parallel, then merge + sort.

    ``session`` is kept for backwards compatibility with the FastAPI dependency
    wiring; each sub-query opens its own session because AsyncSession does not
    support concurrent operations on a single instance.
    """
    submissions, versions, evaluations = await asyncio.gather(
        _recent_submissions(program_id, limit),
        _recent_versions(program_id, limit),
        _recent_evaluations(program_id, limit),
    )

    out: list[ActivityItem] = []
    out.extend(submissions)
    out.extend(versions)
    out.extend(evaluations)
    out.sort(key=lambda i: i.occurred_at, reverse=True)
    return out[:limit]
