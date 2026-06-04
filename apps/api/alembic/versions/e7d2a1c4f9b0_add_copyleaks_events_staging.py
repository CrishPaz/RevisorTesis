"""add copyleaks_events staging table

Tabla donde n8n vuelca los webhooks crudos de Copyleaks (completed/crawled/
result). El backend la pollea para generar plagiarism_matches.

Revision ID: e7d2a1c4f9b0
Revises: d8a4f1c9b6e2
Create Date: 2026-06-04 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "e7d2a1c4f9b0"
down_revision: Union[str, None] = "d8a4f1c9b6e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    copyleaks_event_type = postgresql.ENUM(
        "completed",
        "error",
        "crawled",
        "result",
        name="copyleaks_event_type",
    )
    copyleaks_event_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "copyleaks_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scan_id", sa.String(length=64), nullable=False),
        sa.Column(
            "event_type",
            copyleaks_event_type,
            nullable=False,
        ),
        sa.Column("result_id", sa.String(length=128), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column(
            "processed",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_copyleaks_events_version_id", "copyleaks_events", ["version_id"]
    )
    op.create_index(
        "ix_copyleaks_events_pending",
        "copyleaks_events",
        ["version_id", "event_type"],
        postgresql_where=sa.text("processed = false"),
    )


def downgrade() -> None:
    op.drop_index("ix_copyleaks_events_pending", table_name="copyleaks_events")
    op.drop_index("ix_copyleaks_events_version_id", table_name="copyleaks_events")
    op.drop_table("copyleaks_events")
    postgresql.ENUM(name="copyleaks_event_type").drop(op.get_bind(), checkfirst=True)
