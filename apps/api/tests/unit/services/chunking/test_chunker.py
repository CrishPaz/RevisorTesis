"""Tests unitarios del chunker: propagación de page_number a TextChunk.

Scenario 3.1: chunks con page_number propagado desde párrafos.
Scenario 3.2: chunks con page_number=None (datos pre-migración) sin error.
"""
from __future__ import annotations

from kimy.services.documents.extractor import ExtractedDocument, ExtractedParagraph
from kimy.services.plagiarism.chunker import TARGET_CHARS, TextChunk, chunk_document


def _make_doc(paragraphs: list[ExtractedParagraph]) -> ExtractedDocument:
    return ExtractedDocument(paragraphs=paragraphs, page_count=0)


def _long_text(base: str, target: int = TARGET_CHARS + 50) -> str:
    """Genera un texto suficientemente largo para forzar emit de chunk."""
    repeated = (base + " ") * ((target // len(base)) + 2)
    return repeated[:target]


# ---------------------------------------------------------------------------
# Scenario 3.1: page_number propagado correctamente
# ---------------------------------------------------------------------------

def test_chunk_propaga_primer_page_number_no_null() -> None:
    """El page_number del chunk es el primer page_number no-NULL del grupo."""
    text = _long_text("palabra de relleno para este parrafo largo")
    paragraphs = [
        ExtractedParagraph(text=text[:100], heading_level=None, page_number=2),
        ExtractedParagraph(text=text[100:200], heading_level=None, page_number=2),
        ExtractedParagraph(text=text[200:], heading_level=None, page_number=3),
    ]
    doc = _make_doc(paragraphs)
    chunks = chunk_document(doc)

    assert chunks, "Debe producirse al menos un chunk"
    assert chunks[0].page_number == 2


def test_chunks_multiples_paginas_cada_chunk_tiene_page_number() -> None:
    """Chunks de distintas páginas tienen el page_number correspondiente."""
    long = _long_text("contenido de pagina larga para llenar el chunk")
    paragraphs = [
        ExtractedParagraph(text=long, heading_level=None, page_number=1),
        ExtractedParagraph(text=long, heading_level=None, page_number=2),
        ExtractedParagraph(text=long, heading_level=None, page_number=3),
    ]
    doc = _make_doc(paragraphs)
    chunks = chunk_document(doc)

    page_numbers = [c.page_number for c in chunks if c.page_number is not None]
    assert len(page_numbers) > 0, "Al menos un chunk debe tener page_number"


# ---------------------------------------------------------------------------
# Scenario 3.2: chunks pre-migración con page_number=None — sin error
# ---------------------------------------------------------------------------

def test_chunk_con_paragraphs_sin_page_number_no_falla() -> None:
    """Si todos los párrafos tienen page_number=None, el chunk también tiene None."""
    text = _long_text("parrafo sin numero de pagina para comprobar degradacion")
    paragraphs = [
        ExtractedParagraph(text=text, heading_level=None, page_number=None),
    ]
    doc = _make_doc(paragraphs)
    chunks = chunk_document(doc)

    assert chunks, "Debe producirse al menos un chunk"
    assert all(c.page_number is None for c in chunks)


def test_chunk_page_number_none_cuando_todos_null() -> None:
    """page_number es None cuando ningún párrafo del grupo tiene page_number."""
    text = _long_text("texto largo sin pagina conocida para verificar fallback")
    paragraphs = [
        ExtractedParagraph(text=text[:200], heading_level=None, page_number=None),
        ExtractedParagraph(text=text[200:], heading_level=None, page_number=None),
    ]
    doc = _make_doc(paragraphs)
    chunks = chunk_document(doc)

    for chunk in chunks:
        assert chunk.page_number is None


def test_textchunk_tiene_campo_page_number() -> None:
    """TextChunk acepta el campo page_number sin error (smoke de dataclass)."""
    chunk = TextChunk(
        chunk_index=0,
        section=None,
        text="texto de prueba",
        char_count=15,
        page_number=5,
    )
    assert chunk.page_number == 5
