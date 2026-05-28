"""Tests del servicio annotated_text_builder.

Verifica la lógica de ensamblado de texto y cálculo de spans
sin acceso a base de datos.

Scenarios 4.1 a 4.4 (lógica de builder; auth se verifica en tests de endpoint).
"""
from __future__ import annotations

from unittest.mock import MagicMock
from uuid import uuid4

from kimy.models.plagiarism_match import PlagiarismSource, PlagiarismStatus
from kimy.services.annotated_text_builder import CHUNK_SEPARATOR, build


def _make_chunk(text: str, chunk_index: int, page_number: int | None = None):
    chunk = MagicMock()
    chunk.id = uuid4()
    chunk.text = text
    chunk.chunk_index = chunk_index
    chunk.page_number = page_number
    return chunk


def _make_match(source_chunk_id, similarity: float = 0.8, source=PlagiarismSource.copyleaks):
    match = MagicMock()
    match.id = uuid4()
    match.source = source
    match.similarity = similarity
    match.source_chunk_id = source_chunk_id
    match.status = PlagiarismStatus.pending
    return match


# ---------------------------------------------------------------------------
# Scenario 4.1: versión con matches Copyleaks → texto y spans presentes
# ---------------------------------------------------------------------------

def test_build_con_matches_copyleaks_genera_spans() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Primer fragmento del documento de tesis.", 0, page_number=1)
    match = _make_match(chunk.id, similarity=0.75)

    response = build(version_id, [chunk], [match])

    assert response.version_id == version_id
    assert response.text == chunk.text
    assert len(response.spans) == 1
    span = response.spans[0]
    assert span.start == 0
    assert span.end == len(chunk.text)
    assert span.similarity == 0.75
    assert span.page_number == 1
    assert span.match_id == match.id


# ---------------------------------------------------------------------------
# Scenario 4.2: versión sin matches Copyleaks → spans vacío, texto presente
# ---------------------------------------------------------------------------

def test_build_sin_matches_copyleaks_retorna_spans_vacios() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Texto de tesis sin coincidencias.", 0)

    response = build(version_id, [chunk], [])

    assert response.text == chunk.text
    assert response.spans == []


def test_build_matches_intra_no_aparecen_en_spans() -> None:
    """Matches intra-program no deben incluirse en spans (solo copyleaks)."""
    version_id = uuid4()
    chunk = _make_chunk("Contenido de prueba.", 0)
    match_intra = _make_match(chunk.id, source=PlagiarismSource.intra)

    response = build(version_id, [chunk], [match_intra])

    assert response.spans == []


# ---------------------------------------------------------------------------
# Scenario 4.4 / cálculo de offsets con múltiples chunks
# ---------------------------------------------------------------------------

def test_build_offsets_multiples_chunks() -> None:
    """Los offsets de spans para el segundo chunk incluyen el offset acumulado."""
    version_id = uuid4()
    texto1 = "Primer fragmento largo del primer capítulo."
    texto2 = "Segundo fragmento del segundo capítulo."
    chunk1 = _make_chunk(texto1, 0, page_number=1)
    chunk2 = _make_chunk(texto2, 1, page_number=2)
    match = _make_match(chunk2.id, similarity=0.9)

    response = build(version_id, [chunk1, chunk2], [match])

    assert CHUNK_SEPARATOR in response.text
    expected_offset = len(texto1) + len(CHUNK_SEPARATOR)
    span = response.spans[0]
    assert span.start == expected_offset
    assert span.end == expected_offset + len(texto2)
    assert span.page_number == 2


# ---------------------------------------------------------------------------
# Scenario degradación 3.3: page_number=None en spans → null, sin crash
# ---------------------------------------------------------------------------

def test_build_page_number_null_no_falla() -> None:
    """Chunks con page_number=None producen spans con page_number=null."""
    version_id = uuid4()
    chunk = _make_chunk("Texto de chunk sin numero de pagina.", 0, page_number=None)
    match = _make_match(chunk.id)

    response = build(version_id, [chunk], [match])

    assert len(response.spans) == 1
    assert response.spans[0].page_number is None


def test_build_sin_chunks_retorna_texto_vacio() -> None:
    version_id = uuid4()
    response = build(version_id, [], [])

    assert response.text == ""
    assert response.spans == []
