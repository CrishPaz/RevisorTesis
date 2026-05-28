"""add page_number to document_chunks

Revision ID: ba82df94c9a0
Revises: adb11d380979
Create Date: 2026-05-28 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'ba82df94c9a0'
down_revision: Union[str, None] = 'adb11d380979'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'document_chunks',
        sa.Column('page_number', sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('document_chunks', 'page_number')
