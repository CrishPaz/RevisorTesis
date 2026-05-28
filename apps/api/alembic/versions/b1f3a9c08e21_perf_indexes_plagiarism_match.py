"""perf indexes plagiarism_match (source_chunk_id, matched_chunk_id, reviewed_by)

Revision ID: b1f3a9c08e21
Revises: a59a4f2b578f
Create Date: 2026-05-28 00:00:00.000000

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = 'b1f3a9c08e21'
down_revision: Union[str, None] = 'a59a4f2b578f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        op.f('ix_plagiarism_matches_source_chunk_id'),
        'plagiarism_matches',
        ['source_chunk_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_plagiarism_matches_matched_chunk_id'),
        'plagiarism_matches',
        ['matched_chunk_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_plagiarism_matches_reviewed_by'),
        'plagiarism_matches',
        ['reviewed_by'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_plagiarism_matches_reviewed_by'), table_name='plagiarism_matches'
    )
    op.drop_index(
        op.f('ix_plagiarism_matches_matched_chunk_id'), table_name='plagiarism_matches'
    )
    op.drop_index(
        op.f('ix_plagiarism_matches_source_chunk_id'), table_name='plagiarism_matches'
    )
