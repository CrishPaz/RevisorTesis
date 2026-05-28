"""add enable_copyleaks to submission_versions

Revision ID: adb11d380979
Revises: b1f3a9c08e21
Create Date: 2026-05-28 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'adb11d380979'
down_revision: Union[str, None] = 'b1f3a9c08e21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'submission_versions',
        sa.Column(
            'enable_copyleaks',
            sa.Boolean(),
            server_default=sa.text('true'),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column('submission_versions', 'enable_copyleaks')
