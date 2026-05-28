"""add source_url and matched_text to plagiarism_matches

Revision ID: f3a1b2c4d5e6
Revises: ba82df94c9a0
Create Date: 2026-05-28 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f3a1b2c4d5e6'
down_revision: Union[str, None] = 'ba82df94c9a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'plagiarism_matches',
        sa.Column('source_url', sa.Text(), nullable=True),
    )
    op.add_column(
        'plagiarism_matches',
        sa.Column('matched_text', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('plagiarism_matches', 'matched_text')
    op.drop_column('plagiarism_matches', 'source_url')
