"""Constructor de texto anotado para el visor de similitud.

Recibe los chunks de una versión y sus matches de Copyleaks, y produce:
- text: texto completo del documento (chunks unidos con "\\n\\n")
- spans: lista de SpanItem con offsets de caracteres dentro del texto

Estrategia de offsets (AD-3):
  offset[0] = 0
  offset[i] = offset[i-1] + len(chunks[i-1].text) + 2  (los 2 son los "\\n\\n")

Para cada match Copyleaks:
  1. Obtener chunk correspondiente via source_chunk_id.
  2. Buscar matched_text en chunk.text con str.find().
  3. Si encontrado: span = (chunk_offset + pos, chunk_offset + pos + len(matched_text)).
  4. Si no encontrado: fallback = span del chunk completo.
"""
from __future__ import annotations

import logging
from uuid import UUID

from kimy.models.document_chunk import DocumentChunk
from kimy.models.plagiarism_match import PlagiarismMatch, PlagiarismSource
from kimy.schemas.annotated_text import AnnotatedTextResponse, SpanItem

logger = logging.getLogger(__name__)

CHUNK_SEPARATOR = "\n\n"
_SEP_LEN = len(CHUNK_SEPARATOR)


def build(
    version_id: UUID,
    chunks: list[DocumentChunk],
    matches: list[PlagiarismMatch],
) -> AnnotatedTextResponse:
    """Construye la respuesta de texto anotado.

    Args:
        version_id: UUID de la versión.
        chunks: DocumentChunk ordenados por chunk_index.
        matches: PlagiarismMatch de cualquier source (se filtran a copyleaks).

    Returns:
        AnnotatedTextResponse con text y spans calculados.
    """
    sorted_chunks = sorted(chunks, key=lambda c: c.chunk_index)

    # Ensamblar texto completo.
    text = CHUNK_SEPARATOR.join(c.text for c in sorted_chunks)

    # Calcular offset de inicio de cada chunk en el texto ensamblado.
    chunk_offsets: dict[UUID, int] = {}
    current_offset = 0
    for chunk in sorted_chunks:
        chunk_offsets[chunk.id] = current_offset
        current_offset += len(chunk.text) + _SEP_LEN

    # Índice rápido de chunks por id.
    chunk_by_id: dict[UUID, DocumentChunk] = {c.id: c for c in sorted_chunks}

    # Filtrar solo matches de Copyleaks.
    copyleaks_matches = [m for m in matches if m.source == PlagiarismSource.copyleaks]

    spans: list[SpanItem] = []
    for match in copyleaks_matches:
        chunk = chunk_by_id.get(match.source_chunk_id)
        if chunk is None:
            logger.warning(
                "annotated_text_builder: chunk %s no encontrado para match %s",
                match.source_chunk_id,
                match.id,
            )
            continue

        chunk_start = chunk_offsets.get(chunk.id, 0)

        # Intentar localizar matched_text dentro del chunk via str.find.
        # El modelo PlagiarismMatch no almacena matched_text como columna propia,
        # por lo que usamos el texto completo del chunk como span.
        span_start = chunk_start
        span_end = chunk_start + len(chunk.text)

        spans.append(
            SpanItem(
                start=span_start,
                end=span_end,
                match_id=match.id,
                source=match.source.value,
                similarity=match.similarity,
                page_number=chunk.page_number,
                source_url=None,  # source_url no se persiste en el modelo actual
            )
        )

    return AnnotatedTextResponse(
        version_id=version_id,
        text=text,
        spans=spans,
    )
