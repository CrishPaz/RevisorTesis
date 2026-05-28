"""Chunk an ExtractedDocument into overlapping text windows for embedding.

Strategy: walk paragraphs left-to-right, accumulating into a chunk; emit a new
chunk when the accumulated char count crosses the target. Each chunk remembers
the section heading active when the chunk started.
"""
from __future__ import annotations

from dataclasses import dataclass

from kimy.services.documents.extractor import ExtractedDocument

TARGET_CHARS = 1500
MIN_CHARS_PER_CHUNK = 200


@dataclass(slots=True)
class TextChunk:
    chunk_index: int
    section: str | None
    text: str
    char_count: int
    page_number: int | None = None  # primer page_number no-NULL del grupo de párrafos


def _first_page_number(page_numbers: list[int | None]) -> int | None:
    """Retorna el primer page_number no-NULL de la lista; None si todos son NULL."""
    for pn in page_numbers:
        if pn is not None:
            return pn
    return None


def chunk_document(doc: ExtractedDocument) -> list[TextChunk]:
    chunks: list[TextChunk] = []
    current_paragraphs: list[str] = []
    current_page_numbers: list[int | None] = []
    current_section: str | None = None
    pending_section: str | None = None

    for para in doc.paragraphs:
        if para.heading_level is not None and para.heading_level >= 1:
            # New section starts. Flush accumulated paragraphs under previous section.
            text = "\n".join(current_paragraphs).strip()
            if text and len(text) >= MIN_CHARS_PER_CHUNK:
                chunks.append(
                    TextChunk(
                        chunk_index=len(chunks),
                        section=current_section,
                        text=text,
                        char_count=len(text),
                        page_number=_first_page_number(current_page_numbers),
                    )
                )
            current_paragraphs = []
            current_page_numbers = []
            pending_section = para.text.strip()
            continue

        if pending_section is not None:
            current_section = pending_section
            pending_section = None

        current_paragraphs.append(para.text)
        current_page_numbers.append(para.page_number)
        running = "\n".join(current_paragraphs)
        if len(running) >= TARGET_CHARS:
            chunks.append(
                TextChunk(
                    chunk_index=len(chunks),
                    section=current_section,
                    text=running.strip(),
                    char_count=len(running),
                    page_number=_first_page_number(current_page_numbers),
                )
            )
            current_paragraphs = []
            current_page_numbers = []

    tail = "\n".join(current_paragraphs).strip()
    if tail and len(tail) >= MIN_CHARS_PER_CHUNK:
        chunks.append(
            TextChunk(
                chunk_index=len(chunks),
                section=current_section,
                text=tail,
                char_count=len(tail),
                page_number=_first_page_number(current_page_numbers),
            )
        )
    return chunks
