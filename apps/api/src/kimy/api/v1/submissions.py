from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from kimy.core.deps import CurrentUser, SessionDep, require_roles
from kimy.models.submission import Submission
from kimy.models.submission_version import VersionParsingStatus
from kimy.models.user import UserRole
from kimy.schemas.submissions import (
    SubmissionCreate,
    SubmissionDetail,
    SubmissionSummary,
    SubmissionVersionDetail,
    SubmissionVersionSummary,
)
from kimy.services import programs as programs_service
from kimy.services import storage
from kimy.services import submissions as submissions_service
from kimy.services.ai import pipeline as ai_pipeline

router = APIRouter(prefix="/submissions", tags=["submissions"])

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


def _to_summary(s: Submission) -> SubmissionSummary:
    latest = submissions_service.latest_version(s)
    return SubmissionSummary(
        id=s.id,
        title=s.title,
        chapter=s.chapter,
        status=s.status,
        program_id=s.program_id,
        template_id=s.template_id,
        advisor_id=s.advisor_id,
        student=s.student,  # type: ignore[arg-type]
        program=s.program,  # type: ignore[arg-type]
        created_at=s.created_at,
        latest_version_number=latest.version_number if latest else None,
        latest_version_status=latest.parsing_status if latest else None,
        advisor_fit_score=s.advisor_fit_score,
        advisor_fit_alert=s.advisor_fit_alert,
    )


def _to_detail(s: Submission) -> SubmissionDetail:
    summary = _to_summary(s)
    return SubmissionDetail(
        **summary.model_dump(),
        versions=[SubmissionVersionSummary.model_validate(v) for v in s.versions],
    )


def _ensure_can_access(submission: Submission, user) -> None:
    if not submissions_service.can_access(submission, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="forbidden",
        )


@router.get(
    "/advisors",
    response_model=list[dict],
    dependencies=[Depends(require_roles(UserRole.coordinator, UserRole.admin))],
)
async def list_eligible_advisors(session: SessionDep) -> list[dict]:
    """Lightweight list of advisors for the assignment dropdown."""
    from sqlalchemy import select

    from kimy.models.advisor_profile import AdvisorProfile
    from kimy.models.user import User

    stmt = (
        select(User.id, User.full_name, User.email, AdvisorProfile.orcid_id)
        .join(AdvisorProfile, AdvisorProfile.user_id == User.id)
        .where(User.role == UserRole.advisor, User.is_active.is_(True))
        .order_by(User.full_name)
    )
    rows = (await session.execute(stmt)).all()
    return [
        {
            "id": str(r.id),
            "full_name": r.full_name,
            "email": r.email,
            "orcid_id": r.orcid_id,
            "orcid_linked": r.orcid_id is not None,
        }
        for r in rows
    ]


@router.get("", response_model=list[SubmissionSummary])
async def list_submissions(
    session: SessionDep,
    user: CurrentUser,
    program_id: Annotated[UUID | None, Query()] = None,
    status: Annotated[str | None, Query()] = None,
    advisor_id: Annotated[UUID | None, Query()] = None,
    fit_alert: Annotated[bool | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[SubmissionSummary]:
    from sqlalchemy import func, select as _select

    from kimy.models.ai_evaluation import AIEvaluation
    from kimy.models.ai_finding import AIFinding
    from kimy.models.submission import SubmissionStatus

    parsed_status = SubmissionStatus(status) if status else None
    items = await submissions_service.list_for_user(
        session,
        user,
        program_id=program_id,
        status=parsed_status,
        advisor_id=advisor_id,
        fit_alert=fit_alert,
        limit=limit,
        offset=offset,
    )

    # Batch-load evaluations + findings count for the latest version of each
    # submission — used by the advisor comparison view to avoid N+1 queries.
    latest_version_ids = [
        v.id
        for s in items
        if (v := submissions_service.latest_version(s)) is not None
    ]
    eval_by_version: dict[UUID, tuple[float | None, float | None, int]] = {}
    if latest_version_ids:
        eval_stmt = (
            _select(
                AIEvaluation.version_id,
                AIEvaluation.decimal_grade,
                AIEvaluation.total_percentage,
                func.count(AIFinding.id),
            )
            .outerjoin(AIFinding, AIFinding.evaluation_id == AIEvaluation.id)
            .where(AIEvaluation.version_id.in_(latest_version_ids))
            .group_by(
                AIEvaluation.id,
                AIEvaluation.version_id,
                AIEvaluation.decimal_grade,
                AIEvaluation.total_percentage,
            )
        )
        for version_id, grade, pct, fc in (await session.execute(eval_stmt)).all():
            eval_by_version[version_id] = (grade, pct, fc)

    summaries: list[SubmissionSummary] = []
    for s in items:
        summary = _to_summary(s)
        latest_v = submissions_service.latest_version(s)
        if latest_v is not None and latest_v.id in eval_by_version:
            grade, pct, fc = eval_by_version[latest_v.id]
            summary.latest_grade = grade
            summary.latest_percentage = pct
            summary.findings_count = fc
        summaries.append(summary)
    return summaries


@router.post(
    "",
    response_model=SubmissionDetail,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserRole.student))],
)
async def create_submission(
    payload: SubmissionCreate, session: SessionDep, user: CurrentUser
) -> SubmissionDetail:
    program = await programs_service.get_program(session, payload.program_id)
    if program is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="program not found"
        )
    submission = await submissions_service.create_submission(
        session,
        student_id=user.id,
        program_id=payload.program_id,
        title=payload.title,
        chapter=payload.chapter,
    )
    return _to_detail(submission)


@router.post(
    "/bulk",
    response_model=list[SubmissionDetail],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserRole.student))],
)
async def create_bulk_submissions(
    session: SessionDep,
    user: CurrentUser,
    background: BackgroundTasks,
    program_id: Annotated[UUID, Form()],
    files: Annotated[list[UploadFile], File()],
    titles: Annotated[list[str] | None, Form()] = None,
    chapters: Annotated[list[str] | None, Form()] = None,
) -> list[SubmissionDetail]:
    """Create N submissions in one call — one per uploaded file.

    Each file becomes its own Submission with its own version + AI evaluation.
    `titles[i]` / `chapters[i]` are optional and align by index; missing titles
    default to the filename without extension.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="at least one file is required",
        )
    program = await programs_service.get_program(session, program_id)
    if program is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="program not found"
        )

    created: list[Submission] = []
    for i, f in enumerate(files):
        content = await f.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"file '{f.filename or i}' exceeds "
                    f"{MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit"
                ),
            )

        # Pick the per-file title (fallback to filename without extension).
        title: str | None = None
        if titles is not None and i < len(titles) and titles[i].strip():
            title = titles[i].strip()[:255]
        if not title:
            name = f.filename or f"Avance {i + 1}"
            base = name.rsplit(".", 1)[0] if "." in name else name
            title = (base.strip() or f"Avance {i + 1}")[:255]

        chapter: str | None = None
        if chapters is not None and i < len(chapters) and chapters[i].strip():
            chapter = chapters[i].strip()[:100]

        submission = await submissions_service.create_submission(
            session,
            student_id=user.id,
            program_id=program_id,
            title=title,
            chapter=chapter,
        )
        try:
            version = await submissions_service.upload_version(
                session,
                submission=submission,
                filename=f.filename or "upload.bin",
                content=content,
                mime_type=f.content_type or "application/octet-stream",
                comment=None,
            )
        except submissions_service.UnsupportedFileTypeError as exc:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"{f.filename}: {exc}",
            ) from exc

        if version.parsing_status == VersionParsingStatus.ai_queued:
            background.add_task(ai_pipeline.background_runner, version.id)

        refreshed = await submissions_service.get_submission(session, submission.id)
        if refreshed is not None:
            created.append(refreshed)

    return [_to_detail(s) for s in created]


@router.get("/{submission_id}", response_model=SubmissionDetail)
async def get_submission(
    submission_id: UUID, session: SessionDep, user: CurrentUser
) -> SubmissionDetail:
    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )
    _ensure_can_access(submission, user)
    return _to_detail(submission)


@router.post(
    "/{submission_id}/versions",
    response_model=SubmissionVersionDetail,
    status_code=status.HTTP_201_CREATED,
)
async def upload_version(
    submission_id: UUID,
    session: SessionDep,
    user: CurrentUser,
    background: BackgroundTasks,
    file: UploadFile = File(...),
    comment: Annotated[str | None, Form(max_length=2000)] = None,
    enable_copyleaks: Annotated[bool, Form()] = True,
) -> SubmissionVersionDetail:
    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )

    if user.role == UserRole.student and submission.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="students can only upload to their own submissions",
        )
    if user.role in {UserRole.advisor, UserRole.coordinator}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="only students can upload new versions",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"file exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit",
        )

    try:
        version = await submissions_service.upload_version(
            session,
            submission=submission,
            filename=file.filename or "upload.bin",
            content=content,
            mime_type=file.content_type or "application/octet-stream",
            comment=comment,
            enable_copyleaks=enable_copyleaks,
        )
    except submissions_service.UnsupportedFileTypeError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(exc),
        ) from exc

    if version.parsing_status == VersionParsingStatus.ai_queued:
        background.add_task(ai_pipeline.background_runner, version.id)

    return SubmissionVersionDetail.model_validate(version)


@router.get(
    "/{submission_id}/versions/{version_id}",
    response_model=SubmissionVersionDetail,
)
async def get_version(
    submission_id: UUID,
    version_id: UUID,
    session: SessionDep,
    user: CurrentUser,
) -> SubmissionVersionDetail:
    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )
    _ensure_can_access(submission, user)
    version = next(
        (v for v in submission.versions if v.id == version_id), None
    )
    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="version not found"
        )
    return SubmissionVersionDetail.model_validate(version)


@router.get("/{submission_id}/versions/{version_id}/file")
async def download_version(
    submission_id: UUID,
    version_id: UUID,
    session: SessionDep,
    user: CurrentUser,
) -> FileResponse:
    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )
    _ensure_can_access(submission, user)
    version = next(
        (v for v in submission.versions if v.id == version_id), None
    )
    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="version not found"
        )
    path = storage.resolve(version.storage_path)
    if not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="file missing on disk"
        )
    return FileResponse(
        path=path,
        filename=version.original_filename,
        media_type=version.mime_type,
    )


@router.get(
    "/{submission_id}/versions/{version_id}/annotated-text",
)
async def get_annotated_text(
    submission_id: UUID,
    version_id: UUID,
    session: SessionDep,
    user: CurrentUser,
):
    """Retorna el texto completo del documento con spans de coincidencia Copyleaks.

    Acceso: estudiante dueño de la submission o roles administrativos.
    Retorna 403 si la submission pertenece a otro estudiante, 404 si no existe.
    """
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from kimy.models.document_chunk import DocumentChunk
    from kimy.models.plagiarism_match import PlagiarismMatch
    from kimy.schemas.annotated_text import AnnotatedTextResponse
    from kimy.services import annotated_text_builder

    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )

    # Ownership check para estudiantes — 403 no revela si existe.
    if user.role == UserRole.student and submission.student_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="forbidden",
        )
    # Para roles no-student: verificar acceso general.
    if user.role != UserRole.student:
        _ensure_can_access(submission, user)

    version = next(
        (v for v in submission.versions if v.id == version_id), None
    )
    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="version not found"
        )

    chunks_stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.version_id == version_id)
        .order_by(DocumentChunk.chunk_index)
    )
    chunks = list((await session.execute(chunks_stmt)).scalars().all())

    matches_stmt = (
        select(PlagiarismMatch)
        .where(PlagiarismMatch.version_id == version_id)
    )
    matches = list((await session.execute(matches_stmt)).scalars().all())

    return annotated_text_builder.build(version_id, chunks, matches)


@router.patch(
    "/{submission_id}/advisor",
    response_model=SubmissionDetail,
    dependencies=[Depends(require_roles(UserRole.coordinator, UserRole.admin))],
)
async def assign_advisor(
    submission_id: UUID,
    session: SessionDep,
    advisor_id: Annotated[UUID | None, Body(embed=True)] = None,
) -> SubmissionDetail:
    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )
    updated = await submissions_service.assign_advisor(
        session, submission=submission, advisor_id=advisor_id
    )
    # Recompute ORCID advisor-fit (no-op when advisor has no publications).
    from kimy.services.orcid import advisor_fit
    await advisor_fit.update_submission_fit(
        session, submission_id=updated.id, advisor_id=advisor_id
    )
    refreshed = await submissions_service.get_submission(session, updated.id)
    return _to_detail(refreshed or updated)


async def _build_acta_pdf(
    submission_id: UUID,
    session,
    user,
) -> tuple[bytes, str, Submission]:
    """Internal helper: returns (pdf_bytes, filename, submission).

    Raises HTTPException with the appropriate status on access/missing-data
    errors so endpoints can ``await`` it and FastAPI propagates the error.
    """
    from collections import defaultdict

    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from kimy.models.advisor_profile import AdvisorProfile
    from kimy.models.ai_evaluation import AIEvaluation
    from kimy.models.citation import Citation
    from kimy.models.plagiarism_match import PlagiarismMatch
    from kimy.models.submission_version import SubmissionVersion
    from kimy.models.user import User
    from kimy.services.reports import pdf as reports_pdf

    submission = await submissions_service.get_submission(session, submission_id)
    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
        )
    _ensure_can_access(submission, user)

    latest = submissions_service.latest_version(submission)
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="submission has no version yet",
        )

    eval_stmt = (
        select(AIEvaluation)
        .options(selectinload(AIEvaluation.findings))
        .where(AIEvaluation.version_id == latest.id)
    )
    evaluation = (await session.execute(eval_stmt)).scalar_one_or_none()

    plag_stmt = (
        select(PlagiarismMatch)
        .options(
            selectinload(PlagiarismMatch.matched_version)
            .selectinload(SubmissionVersion.submission)
            .selectinload(Submission.student)
        )
        .where(PlagiarismMatch.version_id == latest.id)
    )
    matches = list((await session.execute(plag_stmt)).scalars().all())
    grouped: dict[UUID, dict[str, object]] = defaultdict(
        lambda: {
            "matched_title": "",
            "matched_student": "",
            "best_similarity": 0.0,
            "chunk_count": 0,
        }
    )
    for m in matches:
        ms = m.matched_version.submission if m.matched_version else None
        title = ms.title if ms else ""
        student = ms.student.full_name if ms and ms.student else ""
        bucket = grouped[m.matched_version_id]
        bucket["matched_title"] = title
        bucket["matched_student"] = student
        bucket["chunk_count"] = int(bucket["chunk_count"]) + 1
        if m.similarity > float(bucket["best_similarity"]):
            bucket["best_similarity"] = m.similarity
    plagiarism_groups = list(grouped.values())

    cit_stmt = select(Citation).where(Citation.version_id == latest.id)
    citations = list((await session.execute(cit_stmt)).scalars().all())
    citations_summary: dict[str, int] = {}
    for c in citations:
        citations_summary[c.crossref_status.value] = (
            citations_summary.get(c.crossref_status.value, 0) + 1
        )

    advisor_name: str | None = None
    advisor_orcid: str | None = None
    if submission.advisor_id:
        advisor_user = await session.get(User, submission.advisor_id)
        if advisor_user:
            advisor_name = advisor_user.full_name
            profile = await session.get(AdvisorProfile, submission.advisor_id)
            if profile and profile.orcid_id:
                advisor_orcid = profile.orcid_id

    pdf_bytes = reports_pdf.render_acta(
        submission=submission,
        evaluation=evaluation,
        advisor_name=advisor_name,
        advisor_orcid=advisor_orcid,
        plagiarism_groups=plagiarism_groups,
        citations_summary=citations_summary,
        advisor_fit_score=submission.advisor_fit_score,
    )

    safe_slug = "".join(c if c.isalnum() else "_" for c in submission.title)[:80] or "acta"
    filename = f"acta_tesis_{safe_slug}.pdf"
    return pdf_bytes, filename, submission


@router.get("/{submission_id}/report.pdf")
async def download_acta_pdf(
    submission_id: UUID,
    session: SessionDep,
    user: CurrentUser,
):
    """Generate the acta de revisión for the latest version of `submission_id`."""
    from fastapi.responses import Response

    pdf_bytes, filename, _ = await _build_acta_pdf(submission_id, session, user)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.post(
    "/{submission_id}/email-report",
    dependencies=[
        Depends(
            require_roles(
                UserRole.student,
                UserRole.advisor,
                UserRole.coordinator,
                UserRole.admin,
            )
        )
    ],
)
async def email_acta_pdf(
    submission_id: UUID,
    session: SessionDep,
    user: CurrentUser,
    to: Annotated[str, Body(min_length=3, max_length=320)],
    message: Annotated[str | None, Body(max_length=2000)] = None,
    report_type: Annotated[str, Body()] = "acta",
) -> dict[str, object]:
    """Genera el reporte solicitado y lo envía por email.

    - report_type="acta" (default): comportamiento anterior — acta de revisión.
    - report_type="plagiarism": reporte de similitud Copyleaks.
    - report_type="both": ambos PDFs adjuntos en el mismo email.

    Estudiante: solo puede acceder a sus propias submissions (ownership check).
    Advisors/coordinadores/admin: acceso según lógica existente (_ensure_can_access).
    """
    import re

    from kimy.services.email.sender import (
        EmailDeliveryError,
        EmailNotConfiguredError,
        send_with_attachments,
    )

    if report_type not in ("acta", "plagiarism", "both"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="report_type debe ser 'acta', 'plagiarism' o 'both'",
        )

    # Minimal RFC-ish email shape check.
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", to.strip()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dirección de correo inválida",
        )

    # Ownership check para estudiantes.
    if user.role == UserRole.student:
        submission_check = await submissions_service.get_submission(session, submission_id)
        if submission_check is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
            )
        if submission_check.student_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="forbidden",
            )

    sender_label = user.full_name or "la plataforma"
    attachments: list[tuple[bytes, str, str]] = []

    if report_type in ("acta", "both"):
        acta_bytes, acta_filename, submission = await _build_acta_pdf(
            submission_id, session, user
        )
        attachments.append((acta_bytes, acta_filename, "application/pdf"))
    else:
        # Cargar la submission para el asunto y cuerpo del email.
        submission = await submissions_service.get_submission(session, submission_id)
        if submission is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="submission not found"
            )
        if user.role != UserRole.student:
            _ensure_can_access(submission, user)

    if report_type in ("plagiarism", "both"):
        from sqlalchemy import select as _select

        from kimy.models.plagiarism_match import PlagiarismMatch, PlagiarismSource
        from kimy.services.reports.pdf_reports import render_plagiarism_report

        latest = submissions_service.latest_version(submission)
        if latest is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La submission no tiene versiones",
            )

        from sqlalchemy.orm import selectinload as _selectinload

        matches_stmt = (
            _select(PlagiarismMatch)
            .options(_selectinload(PlagiarismMatch.source_chunk))
            .where(
                PlagiarismMatch.version_id == latest.id,
                PlagiarismMatch.source == PlagiarismSource.copyleaks,
            )
        )
        copyleaks_matches = list((await session.execute(matches_stmt)).scalars().all())

        if not copyleaks_matches:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No hay resultados de similitud Copyleaks para esta version",
            )

        plag_bytes = render_plagiarism_report(
            submission_title=submission.title,
            matches=copyleaks_matches,
        )
        safe_slug = "".join(c if c.isalnum() else "_" for c in submission.title)[:80] or "plagiarism"
        plag_filename = f"similitud_copyleaks_{safe_slug}.pdf"
        attachments.append((plag_bytes, plag_filename, "application/pdf"))

    custom = (message or "").strip()
    subject = f"Reporte académico — {submission.title}"
    body_text = (
        f"Hola,\n\n"
        f"Te comparto el reporte académico del avance "
        f'"{submission.title}".\n\n'
        + (f"Mensaje:\n{custom}\n\n" if custom else "")
        + f"Saludos,\n{sender_label}\nPlataforma Tesis"
    )
    body_html = (
        "<p>Hola,</p>"
        f"<p>Te comparto el reporte académico del avance "
        f"<b>{submission.title}</b>.</p>"
        + (
            f"<p><b>Mensaje:</b><br/>{custom.replace(chr(10), '<br/>')}</p>"
            if custom
            else ""
        )
        + f"<p>Saludos,<br/>{sender_label}<br/><i>Plataforma Tesis</i></p>"
    )

    filenames = [fn for _, fn, _ in attachments]
    try:
        await send_with_attachments(
            to=to.strip(),
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            attachments=attachments,
        )
    except EmailNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"No se pudo enviar el correo: {exc}",
        ) from exc

    return {"ok": True, "to": to.strip(), "filenames": filenames}
