"""Sincronización de ORCID público para estudiantes.

Diferencia vs ``sync.py`` (asesor): no hay OAuth user, no hay tokens, todo
sale del ``public_lookup`` con un read-public token. La integridad temática
del estudiante no impacta advisor-fit — solo enriquece su perfil.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from kimy.models.orcid_publication import OWNER_TYPE_STUDENT, OrcidPublication
from kimy.models.student_profile import StudentProfile
from kimy.services.orcid.public_lookup import PublicProfile, fetch_public_profile
from kimy.services.plagiarism.embedder import embed_texts

logger = logging.getLogger(__name__)


async def validate_and_link_student(
    session: AsyncSession,
    *,
    student_user_id: UUID,
    raw_orcid_id: str,
) -> tuple[StudentProfile, PublicProfile]:
    """Valida el iD, consulta ORCID público y persiste todo.

    Idempotente: si el estudiante ya tenía un iD vinculado, lo reemplaza.
    """
    profile = await session.get(StudentProfile, student_user_id)
    if profile is None:
        raise ValueError(f"StudentProfile {student_user_id} no encontrado")

    public = await fetch_public_profile(raw_orcid_id)

    profile.orcid_id = public.orcid_id
    full_name = " ".join(
        part for part in (public.person.given_name, public.person.family_name) if part
    ).strip() or None
    profile.orcid_full_name = full_name[:255] if full_name else None
    profile.orcid_affiliation = (
        public.person.affiliation[:255] if public.person.affiliation else None
    )
    profile.orcid_last_sync = datetime.now(UTC)

    # Reemplazar publicaciones del estudiante.
    await session.execute(
        delete(OrcidPublication).where(
            OrcidPublication.owner_id == student_user_id,
            OrcidPublication.owner_type == OWNER_TYPE_STUDENT,
        )
    )
    await session.flush()

    if public.works:
        titles = [w.title for w in public.works]
        embeddings, _backend = await asyncio.to_thread(embed_texts, titles)
        for work, vector in zip(public.works, embeddings, strict=True):
            session.add(
                OrcidPublication(
                    owner_id=student_user_id,
                    owner_type=OWNER_TYPE_STUDENT,
                    put_code=work.put_code,
                    title=work.title,
                    year=work.year,
                    journal=work.journal,
                    doi=work.doi,
                    url=work.url,
                    embedding=vector,
                )
            )

    await session.commit()
    await session.refresh(profile)
    return profile, public


async def unlink_student(session: AsyncSession, student_user_id: UUID) -> bool:
    profile = await session.get(StudentProfile, student_user_id)
    if profile is None or profile.orcid_id is None:
        return False
    profile.orcid_id = None
    profile.orcid_full_name = None
    profile.orcid_affiliation = None
    profile.orcid_last_sync = None
    await session.execute(
        delete(OrcidPublication).where(
            OrcidPublication.owner_id == student_user_id,
            OrcidPublication.owner_type == OWNER_TYPE_STUDENT,
        )
    )
    await session.commit()
    return True


async def get_student_publications(
    session: AsyncSession, student_user_id: UUID
) -> list[OrcidPublication]:
    stmt = (
        select(OrcidPublication)
        .where(
            OrcidPublication.owner_id == student_user_id,
            OrcidPublication.owner_type == OWNER_TYPE_STUDENT,
        )
        .order_by(OrcidPublication.year.desc().nulls_last(), OrcidPublication.title)
    )
    return list((await session.execute(stmt)).scalars().all())
