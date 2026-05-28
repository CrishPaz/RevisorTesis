"""ORCID OAuth endpoints.

Flow:
1. Advisor hits ``POST /api/v1/orcid/authorize`` — we return a redirect URL
   (real ORCID, or our own callback when running in stub mode).
2. ORCID (or the stub helper) redirects the browser to
   ``/orcid/callback?code=…&state=…`` on the **web** app, which then POSTs to
   ``/api/v1/orcid/callback`` here to finish the exchange and sync publications.
3. ``GET /api/v1/orcid/me`` returns the advisor's current ORCID status + works.
4. ``DELETE /api/v1/orcid/me`` unlinks.

CSRF state is signed and round-tripped — the frontend keeps the value in a
short-lived cookie and we verify it matches on callback.
"""
from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from kimy.core.deps import CurrentUser, SessionDep, require_roles
from kimy.models.student_profile import StudentProfile
from kimy.models.user import UserRole
from kimy.schemas.orcid import (
    OrcidAuthorizeOut,
    OrcidLinkResult,
    OrcidPublicationOut,
    OrcidStatusOut,
    OrcidStudentStatusOut,
    OrcidStudentValidateIn,
)
from kimy.services.orcid import oauth as orcid_oauth
from kimy.services.orcid import public_lookup as orcid_public
from kimy.services.orcid import student_sync as orcid_student
from kimy.services.orcid import sync as orcid_sync

router = APIRouter(prefix="/orcid", tags=["orcid"])

_ADVISOR_ONLY = [Depends(require_roles(UserRole.advisor))]
_STUDENT_ONLY = [Depends(require_roles(UserRole.student))]


class _CallbackPayload(BaseModel):
    code: str
    state: str
    expected_state: str


@router.post(
    "/authorize",
    response_model=OrcidAuthorizeOut,
    dependencies=_ADVISOR_ONLY,
)
async def authorize(user: CurrentUser) -> OrcidAuthorizeOut:
    state = secrets.token_urlsafe(24)
    url = orcid_oauth.build_authorize_url(state)
    return OrcidAuthorizeOut(
        authorize_url=url,
        state=state,
        mode="real" if orcid_oauth.is_real_mode() else "stub",
    )


@router.post(
    "/callback",
    response_model=OrcidLinkResult,
    dependencies=_ADVISOR_ONLY,
)
async def callback(
    payload: _CallbackPayload,
    session: SessionDep,
    user: CurrentUser,
) -> OrcidLinkResult:
    if payload.state != payload.expected_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="state mismatch"
        )
    try:
        token = await orcid_oauth.exchange_code(payload.code)
    except orcid_oauth.OrcidAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    try:
        profile = await orcid_sync.link_advisor(
            session, advisor_user_id=user.id, token=token
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc

    publications = await orcid_sync.get_advisor_publications(session, user.id)
    return OrcidLinkResult(
        linked=profile.orcid_id is not None,
        orcid_id=profile.orcid_id,
        affiliation=profile.affiliation,
        last_sync=profile.orcid_last_sync,
        publications_count=len(publications),
        backend=token.backend,
    )


@router.get("/me", response_model=OrcidStatusOut, dependencies=_ADVISOR_ONLY)
async def me_status(session: SessionDep, user: CurrentUser) -> OrcidStatusOut:
    from kimy.models.advisor_profile import AdvisorProfile

    profile = await session.get(AdvisorProfile, user.id)
    publications = await orcid_sync.get_advisor_publications(session, user.id)
    if profile is None:
        return OrcidStatusOut(
            linked=False,
            orcid_id=None,
            affiliation=None,
            last_sync=None,
            publications_count=0,
        )
    return OrcidStatusOut(
        linked=profile.orcid_id is not None,
        orcid_id=profile.orcid_id,
        affiliation=profile.affiliation,
        last_sync=profile.orcid_last_sync,
        publications_count=len(publications),
    )


@router.get(
    "/me/publications",
    response_model=list[OrcidPublicationOut],
    dependencies=_ADVISOR_ONLY,
)
async def me_publications(
    session: SessionDep, user: CurrentUser
) -> list[OrcidPublicationOut]:
    publications = await orcid_sync.get_advisor_publications(session, user.id)
    return [OrcidPublicationOut.model_validate(p) for p in publications]


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=_ADVISOR_ONLY,
)
async def unlink(session: SessionDep, user: CurrentUser) -> None:
    await orcid_sync.unlink_advisor(session, user.id)


# ---------------------------------------------------------------------------
# Estudiante — validación liviana (2-legged / read-public).
# ---------------------------------------------------------------------------


def _student_status_payload(
    profile: StudentProfile | None,
    publications_count: int,
) -> OrcidStudentStatusOut:
    if profile is None or profile.orcid_id is None:
        return OrcidStudentStatusOut(
            linked=False,
            orcid_id=None,
            full_name=None,
            affiliation=None,
            last_sync=None,
            publications_count=0,
            mode="real" if orcid_public.is_real_mode() else "stub",
        )
    return OrcidStudentStatusOut(
        linked=True,
        orcid_id=profile.orcid_id,
        full_name=profile.orcid_full_name,
        affiliation=profile.orcid_affiliation,
        last_sync=profile.orcid_last_sync,
        publications_count=publications_count,
        mode="real" if orcid_public.is_real_mode() else "stub",
    )


@router.get(
    "/student/me",
    response_model=OrcidStudentStatusOut,
    dependencies=_STUDENT_ONLY,
)
async def student_me(
    session: SessionDep, user: CurrentUser
) -> OrcidStudentStatusOut:
    profile = await session.get(StudentProfile, user.id)
    publications = await orcid_student.get_student_publications(session, user.id)
    return _student_status_payload(profile, len(publications))


@router.post(
    "/student/validate",
    response_model=OrcidStudentStatusOut,
    dependencies=_STUDENT_ONLY,
)
async def student_validate(
    payload: OrcidStudentValidateIn,
    session: SessionDep,
    user: CurrentUser,
) -> OrcidStudentStatusOut:
    try:
        profile, _public = await orcid_student.validate_and_link_student(
            session,
            student_user_id=user.id,
            raw_orcid_id=payload.orcid_id,
        )
    except orcid_public.OrcidLookupError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc

    publications = await orcid_student.get_student_publications(session, user.id)
    return _student_status_payload(profile, len(publications))


@router.get(
    "/student/me/publications",
    response_model=list[OrcidPublicationOut],
    dependencies=_STUDENT_ONLY,
)
async def student_me_publications(
    session: SessionDep, user: CurrentUser
) -> list[OrcidPublicationOut]:
    publications = await orcid_student.get_student_publications(session, user.id)
    return [OrcidPublicationOut.model_validate(p) for p in publications]


@router.delete(
    "/student/me",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=_STUDENT_ONLY,
)
async def student_unlink(session: SessionDep, user: CurrentUser) -> None:
    await orcid_student.unlink_student(session, user.id)
