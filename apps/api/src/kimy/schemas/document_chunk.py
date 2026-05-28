from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentChunkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    version_id: UUID
    chunk_index: int
    section: str | None
    text: str
    char_count: int
    page_number: int | None
