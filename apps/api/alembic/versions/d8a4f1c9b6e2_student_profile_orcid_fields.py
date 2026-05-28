"""student_profiles: orcid fields

Agrega ``orcid_id``, ``orcid_full_name``, ``orcid_affiliation`` y
``orcid_last_sync`` al perfil del estudiante. La validación es liviana
(2-legged / read-public), por eso no guardamos tokens cifrados como en el asesor.

Revision ID: d8a4f1c9b6e2
Revises: c1f9b2e6a3d7
Create Date: 2026-05-28 16:30:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d8a4f1c9b6e2"
down_revision: Union[str, None] = "c1f9b2e6a3d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "student_profiles",
        sa.Column("orcid_id", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "student_profiles",
        sa.Column("orcid_full_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "student_profiles",
        sa.Column("orcid_affiliation", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "student_profiles",
        sa.Column(
            "orcid_last_sync",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_student_profiles_orcid_id",
        "student_profiles",
        ["orcid_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_student_profiles_orcid_id", table_name="student_profiles"
    )
    op.drop_column("student_profiles", "orcid_last_sync")
    op.drop_column("student_profiles", "orcid_affiliation")
    op.drop_column("student_profiles", "orcid_full_name")
    op.drop_column("student_profiles", "orcid_id")
