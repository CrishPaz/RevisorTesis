"""orcid_publications polymorphic owner

Renombra ``advisor_id`` a ``owner_id`` y agrega ``owner_type``
(``advisor`` | ``student``) para que la tabla pueda almacenar publicaciones
tanto de asesores como de estudiantes. La FK pasa de ``advisor_profiles.user_id``
a ``users.id`` porque ambos perfiles comparten el mismo ``users.id`` como PK.

Revision ID: c1f9b2e6a3d7
Revises: f3a1b2c4d5e6
Create Date: 2026-05-28 16:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1f9b2e6a3d7"
down_revision: Union[str, None] = "f3a1b2c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orcid_publications",
        sa.Column("owner_type", sa.String(length=16), nullable=True),
    )
    op.execute("UPDATE orcid_publications SET owner_type = 'advisor'")
    op.alter_column("orcid_publications", "owner_type", nullable=False)

    op.drop_index(
        "ix_orcid_publications_advisor_id", table_name="orcid_publications"
    )
    op.drop_constraint(
        "uq_orcid_publications_advisor_put_code",
        "orcid_publications",
        type_="unique",
    )
    op.drop_constraint(
        "orcid_publications_advisor_id_fkey",
        "orcid_publications",
        type_="foreignkey",
    )

    op.alter_column(
        "orcid_publications",
        "advisor_id",
        new_column_name="owner_id",
    )

    op.create_foreign_key(
        "orcid_publications_owner_id_fkey",
        "orcid_publications",
        "users",
        ["owner_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_unique_constraint(
        "uq_orcid_publications_owner_put_code",
        "orcid_publications",
        ["owner_id", "put_code"],
    )
    op.create_index(
        "ix_orcid_publications_owner_id",
        "orcid_publications",
        ["owner_id"],
    )
    op.create_index(
        "ix_orcid_publications_owner_type_owner_id",
        "orcid_publications",
        ["owner_type", "owner_id"],
    )
    op.create_check_constraint(
        "ck_orcid_publications_owner_type",
        "orcid_publications",
        "owner_type IN ('advisor', 'student')",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_orcid_publications_owner_type",
        "orcid_publications",
        type_="check",
    )
    op.drop_index(
        "ix_orcid_publications_owner_type_owner_id",
        table_name="orcid_publications",
    )
    op.drop_index(
        "ix_orcid_publications_owner_id", table_name="orcid_publications"
    )
    op.drop_constraint(
        "uq_orcid_publications_owner_put_code",
        "orcid_publications",
        type_="unique",
    )
    op.drop_constraint(
        "orcid_publications_owner_id_fkey",
        "orcid_publications",
        type_="foreignkey",
    )

    op.execute("DELETE FROM orcid_publications WHERE owner_type <> 'advisor'")

    op.alter_column(
        "orcid_publications",
        "owner_id",
        new_column_name="advisor_id",
    )

    op.create_foreign_key(
        "orcid_publications_advisor_id_fkey",
        "orcid_publications",
        "advisor_profiles",
        ["advisor_id"],
        ["user_id"],
        ondelete="CASCADE",
    )
    op.create_unique_constraint(
        "uq_orcid_publications_advisor_put_code",
        "orcid_publications",
        ["advisor_id", "put_code"],
    )
    op.create_index(
        "ix_orcid_publications_advisor_id",
        "orcid_publications",
        ["advisor_id"],
    )

    op.drop_column("orcid_publications", "owner_type")
