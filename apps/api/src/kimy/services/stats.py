"""Aggregate statistics for the coordinator/admin dashboard.

All queries are read-only and respect the optional ``program_id`` filter so the
same endpoint can drive a program-level view or a global view.

The dashboard fans out ~10 independent aggregate queries in parallel: each one
opens its own AsyncSession (asyncpg connections cannot multiplex on a single
session). Wall time drops from "sum of all latencies" to "max of all latencies".
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from kimy.db.session import AsyncSessionLocal
from kimy.models.academic_program import AcademicProgram
from kimy.models.advisor_profile import AdvisorProfile
from kimy.models.ai_evaluation import AIEvaluation
from kimy.models.ai_finding import AIFinding, HumanAction
from kimy.models.citation import Citation, CitationStatus
from kimy.models.plagiarism_match import PlagiarismMatch
from kimy.models.submission import Submission, SubmissionStatus
from kimy.models.submission_version import SubmissionVersion


@dataclass(slots=True)
class StatusCount:
    status: str
    count: int


@dataclass(slots=True)
class ProgramGrade:
    program_id: str
    program_code: str
    program_name: str
    average_grade: float
    submissions_count: int


@dataclass(slots=True)
class StatsOverview:
    total_submissions: int = 0
    total_advisors_with_orcid: int = 0
    submissions_by_status: list[StatusCount] = field(default_factory=list)
    avg_ai_grade: float | None = None
    avg_ai_percentage: float | None = None
    ai_human_concordance_pct: float | None = None
    plagiarism_alerts: int = 0
    advisor_fit_alerts: int = 0
    low_compliance_submissions: int = 0  # AI total_percentage < 60
    citations_total: int = 0
    citations_problematic: int = 0  # not_found + hallucinated + partial
    grades_per_program: list[ProgramGrade] = field(default_factory=list)


def _maybe_filter_program(stmt, program_id: UUID | None):
    """Helper: tack on the program filter when present."""
    if program_id is None:
        return stmt
    return stmt.where(Submission.program_id == program_id)


async def _q_total(program_id: UUID | None) -> int:
    base = select(Submission)
    base = _maybe_filter_program(base, program_id)
    async with AsyncSessionLocal() as s:
        return (
            await s.scalar(select(func.count()).select_from(base.subquery()))
        ) or 0


async def _q_by_status(program_id: UUID | None) -> list[StatusCount]:
    stmt = select(Submission.status, func.count(Submission.id)).group_by(
        Submission.status
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        rows = (await s.execute(stmt)).all()
    return [
        StatusCount(
            status=(st.value if isinstance(st, SubmissionStatus) else str(st)),
            count=int(c),
        )
        for st, c in rows
    ]


async def _q_grade(program_id: UUID | None) -> tuple[float | None, float | None]:
    stmt = (
        select(
            func.avg(AIEvaluation.decimal_grade),
            func.avg(AIEvaluation.total_percentage),
            func.count(AIEvaluation.id),
        )
        .join(SubmissionVersion, SubmissionVersion.id == AIEvaluation.version_id)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        avg_grade, avg_pct, count = (await s.execute(stmt)).one()
    if not count:
        return None, None
    return (
        float(avg_grade) if avg_grade is not None else None,
        float(avg_pct) if avg_pct is not None else None,
    )


async def _q_concordance(program_id: UUID | None) -> float | None:
    stmt = (
        select(
            func.count(AIFinding.id),
            func.sum(
                case((AIFinding.human_action == HumanAction.accepted, 1), else_=0)
            ),
        )
        .join(AIEvaluation, AIEvaluation.id == AIFinding.evaluation_id)
        .join(SubmissionVersion, SubmissionVersion.id == AIEvaluation.version_id)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
        .where(AIFinding.human_action.is_not(None))
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        reviewed, accepted = (await s.execute(stmt)).one()
    if not reviewed:
        return None
    return float(accepted or 0) * 100.0 / float(reviewed)


async def _q_plagiarism_alerts(program_id: UUID | None) -> int:
    stmt = (
        select(func.count(func.distinct(PlagiarismMatch.version_id)))
        .join(SubmissionVersion, SubmissionVersion.id == PlagiarismMatch.version_id)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        return int((await s.execute(stmt)).scalar() or 0)


async def _q_advisor_fit_alerts(program_id: UUID | None) -> int:
    stmt = select(func.count(Submission.id)).where(
        Submission.advisor_fit_alert.is_(True)
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        return int((await s.execute(stmt)).scalar() or 0)


async def _q_low_compliance(program_id: UUID | None) -> int:
    stmt = (
        select(func.count(func.distinct(Submission.id)))
        .join(SubmissionVersion, SubmissionVersion.submission_id == Submission.id)
        .join(AIEvaluation, AIEvaluation.version_id == SubmissionVersion.id)
        .where(AIEvaluation.total_percentage < 60)
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        return int((await s.execute(stmt)).scalar() or 0)


async def _q_citations(program_id: UUID | None) -> tuple[int, int]:
    stmt = (
        select(
            func.count(Citation.id),
            func.sum(
                case(
                    (
                        Citation.crossref_status.in_(
                            [
                                CitationStatus.not_found,
                                CitationStatus.hallucinated,
                                CitationStatus.partial,
                            ]
                        ),
                        1,
                    ),
                    else_=0,
                )
            ),
        )
        .join(SubmissionVersion, SubmissionVersion.id == Citation.version_id)
        .join(Submission, Submission.id == SubmissionVersion.submission_id)
    )
    stmt = _maybe_filter_program(stmt, program_id)
    async with AsyncSessionLocal() as s:
        total, bad = (await s.execute(stmt)).one()
    return int(total or 0), int(bad or 0)


async def _q_grades_per_program() -> list[ProgramGrade]:
    stmt = (
        select(
            AcademicProgram.id,
            AcademicProgram.code,
            AcademicProgram.name,
            func.avg(AIEvaluation.decimal_grade),
            func.count(func.distinct(Submission.id)),
        )
        .join(Submission, Submission.program_id == AcademicProgram.id)
        .join(SubmissionVersion, SubmissionVersion.submission_id == Submission.id)
        .join(AIEvaluation, AIEvaluation.version_id == SubmissionVersion.id)
        .group_by(AcademicProgram.id, AcademicProgram.code, AcademicProgram.name)
        .order_by(AcademicProgram.code)
    )
    async with AsyncSessionLocal() as s:
        rows = (await s.execute(stmt)).all()
    return [
        ProgramGrade(
            program_id=str(pid),
            program_code=code,
            program_name=name,
            average_grade=float(avg or 0),
            submissions_count=int(cnt or 0),
        )
        for pid, code, name, avg, cnt in rows
    ]


async def _q_advisors_with_orcid() -> int:
    stmt = select(func.count(AdvisorProfile.user_id)).where(
        AdvisorProfile.orcid_id.is_not(None)
    )
    async with AsyncSessionLocal() as s:
        return int((await s.execute(stmt)).scalar() or 0)


async def overview(
    session: AsyncSession, *, program_id: UUID | None = None
) -> StatsOverview:
    """Fan out every dashboard aggregate in parallel.

    The ``session`` argument is kept for backwards compatibility with the
    FastAPI dependency wiring; each aggregate uses its own session because
    AsyncSession does not support concurrent operations on the same instance.
    """
    out = StatsOverview()

    # Run independent aggregates in parallel. Each owns its own session.
    tasks = [
        _q_total(program_id),
        _q_by_status(program_id),
        _q_grade(program_id),
        _q_concordance(program_id),
        _q_plagiarism_alerts(program_id),
        _q_advisor_fit_alerts(program_id),
        _q_low_compliance(program_id),
        _q_citations(program_id),
        _q_advisors_with_orcid(),
    ]
    if program_id is None:
        tasks.append(_q_grades_per_program())

    results = await asyncio.gather(*tasks)

    out.total_submissions = results[0]
    out.submissions_by_status = results[1]
    avg_grade, avg_pct = results[2]
    out.avg_ai_grade = avg_grade
    out.avg_ai_percentage = avg_pct
    out.ai_human_concordance_pct = results[3]
    out.plagiarism_alerts = results[4]
    out.advisor_fit_alerts = results[5]
    out.low_compliance_submissions = results[6]
    out.citations_total, out.citations_problematic = results[7]
    out.total_advisors_with_orcid = results[8]
    if program_id is None:
        out.grades_per_program = results[9]

    return out
