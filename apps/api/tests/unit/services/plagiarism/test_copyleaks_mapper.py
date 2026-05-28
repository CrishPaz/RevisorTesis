"""Tests unitarios del copyleaks_mapper.

Escenarios 2.1 a 2.4 verificados con objetos en memoria (sin DB).
"""
from __future__ import annotations

from unittest.mock import MagicMock
from uuid import uuid4

from kimy.models.plagiarism_match import PlagiarismSource, PlagiarismStatus
from kimy.services.plagiarism.copyleaks_client import CopyleaksHit
from kimy.services.plagiarism.copyleaks_mapper import map_copyleaks_hits


def _make_chunk(text: str, chunk_index: int = 0):
    """Crea un mock de DocumentChunk con id y text."""
    chunk = MagicMock()
    chunk.id = uuid4()
    chunk.text = text
    chunk.chunk_index = chunk_index
    return chunk


# ---------------------------------------------------------------------------
# Scenario 2.1: hit con texto encontrado en un chunk → match persistido
# ---------------------------------------------------------------------------

def test_hit_con_texto_encontrado_genera_match() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Este es el contenido del primer capítulo de la tesis.")
    hit = CopyleaksHit(
        url="https://fuente.example.com",
        matched_text="contenido del primer capítulo",
        similarity=0.75,
    )

    matches = map_copyleaks_hits(version_id, [hit], [chunk])

    assert len(matches) == 1
    m = matches[0]
    assert m.version_id == version_id
    assert m.source == PlagiarismSource.copyleaks
    assert m.status == PlagiarismStatus.pending
    assert abs(m.similarity - 0.75) < 0.001
    assert m.source_chunk_id == chunk.id


# ---------------------------------------------------------------------------
# Scenario 2.2: flag OFF — no se llama al mapper (integración; aquí smoke)
# ---------------------------------------------------------------------------

def test_sin_hits_retorna_lista_vacia() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Texto de ejemplo para el chunk.")

    matches = map_copyleaks_hits(version_id, [], [chunk])

    assert matches == []


# ---------------------------------------------------------------------------
# Scenario 2.3: hit sin texto → descartado con warning
# ---------------------------------------------------------------------------

def test_hit_sin_texto_es_descartado() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Texto de ejemplo para el chunk de prueba.")
    hit_sin_texto = CopyleaksHit(url="https://x.com", matched_text="", similarity=0.5)
    hit_con_texto = CopyleaksHit(
        url="https://y.com", matched_text="Texto de ejemplo para el chunk", similarity=0.8
    )

    matches = map_copyleaks_hits(version_id, [hit_sin_texto, hit_con_texto], [chunk])

    assert len(matches) == 1
    assert matches[0].similarity == 0.8


# ---------------------------------------------------------------------------
# Scenario 2.4: matched_text no encontrado en ningún chunk → descartado
# ---------------------------------------------------------------------------

def test_hit_no_encontrado_en_chunks_es_descartado() -> None:
    version_id = uuid4()
    chunk = _make_chunk("Contenido completamente diferente al hit externo.")
    hit = CopyleaksHit(
        url="https://fuente.com",
        matched_text="texto que no aparece en ningún chunk del documento",
        similarity=0.9,
    )

    matches = map_copyleaks_hits(version_id, [hit], [chunk])

    assert matches == []


def test_sin_chunks_todos_los_hits_descartados() -> None:
    version_id = uuid4()
    hits = [CopyleaksHit(url="https://x.com", matched_text="algo", similarity=0.5)]

    matches = map_copyleaks_hits(version_id, hits, [])

    assert matches == []


def test_multiple_hits_con_texto_genera_multiple_matches() -> None:
    version_id = uuid4()
    chunk1 = _make_chunk("primer fragmento del capítulo uno de la tesis doctoral.", 0)
    chunk2 = _make_chunk("segundo fragmento del capítulo dos con distinto contenido.", 1)
    hits = [
        CopyleaksHit(url="https://a.com", matched_text="fragmento del capítulo uno", similarity=0.8),
        CopyleaksHit(url="https://b.com", matched_text="fragmento del capítulo dos", similarity=0.6),
    ]

    matches = map_copyleaks_hits(version_id, hits, [chunk1, chunk2])

    assert len(matches) == 2
    similarities = {m.similarity for m in matches}
    assert 0.8 in similarities
    assert 0.6 in similarities
