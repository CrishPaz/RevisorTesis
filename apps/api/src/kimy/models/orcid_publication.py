from __future__ import annotations

from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from kimy.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from kimy.models.document_chunk import EMBEDDING_DIM


OWNER_TYPE_ADVISOR = "advisor"
OWNER_TYPE_STUDENT = "student"
OWNER_TYPES = (OWNER_TYPE_ADVISOR, OWNER_TYPE_STUDENT)


class OrcidPublication(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Publicación importada desde ORCID.

    Polimórfica: ``owner_type`` discrimina si pertenece a un asesor o a un
    estudiante. ``owner_id`` apunta a ``users.id`` porque ambos perfiles tienen
    el ``user_id`` como PK que coincide con ``users.id``.
    """

    __tablename__ = "orcid_publications"
    __table_args__ = (
        UniqueConstraint(
            "owner_id", "put_code", name="uq_orcid_publications_owner_put_code"
        ),
        CheckConstraint(
            f"owner_type IN ({', '.join(repr(t) for t in OWNER_TYPES)})",
            name="ck_orcid_publications_owner_type",
        ),
    )

    owner_id: Mapped[UUID] = mapped_column(
        PgUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    owner_type: Mapped[str] = mapped_column(String(16), nullable=False)

    put_code: Mapped[str] = mapped_column(String(50), nullable=False)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    journal: Mapped[str | None] = mapped_column(String(500), nullable=True)
    doi: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    embedding: Mapped[list[float]] = mapped_column(Vector(EMBEDDING_DIM), nullable=False)
