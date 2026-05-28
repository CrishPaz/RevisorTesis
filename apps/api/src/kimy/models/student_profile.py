from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from kimy.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from kimy.models.academic_program import AcademicProgram
    from kimy.models.user import User


class StudentProfile(TimestampMixin, Base):
    __tablename__ = "student_profiles"

    user_id: Mapped[UUID] = mapped_column(
        PgUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    program_id: Mapped[UUID | None] = mapped_column(
        PgUUID(as_uuid=True),
        ForeignKey("academic_programs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    advisor_id: Mapped[UUID | None] = mapped_column(
        PgUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    student_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ORCID — validación liviana (2-legged), sin tokens.
    orcid_id: Mapped[str | None] = mapped_column(
        String(50), nullable=True, unique=True, index=True
    )
    orcid_full_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    orcid_affiliation: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    orcid_last_sync: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped[User] = relationship(
        foreign_keys=[user_id],
        back_populates="student_profile",
    )
    program: Mapped[AcademicProgram | None] = relationship(back_populates="students")
    advisor: Mapped[User | None] = relationship(foreign_keys=[advisor_id])
