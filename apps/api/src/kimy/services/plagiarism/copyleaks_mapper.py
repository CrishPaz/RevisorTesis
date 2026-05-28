"""Mapper: convierte hits de Copyleaks a filas PlagiarismMatch.

Estrategia para source_chunk_id:
  1. Por cada hit, busca matched_text en el texto de cada chunk con str.find().
  2. Si se encuentra en algún chunk, ese chunk es el source_chunk.
  3. Si no se encuentra en ninguno (whitespace reflow, texto truncado), se descarta
     el hit con un logger.warning — no se persiste un match sin ancla confiable.
"""
from __future__ import annotations

import logging
from uuid import UUID

from kimy.models.document_chunk import DocumentChunk
from kimy.models.plagiarism_match import PlagiarismMatch, PlagiarismSource, PlagiarismStatus
from kimy.services.plagiarism.copyleaks_client import CopyleaksHit

logger = logging.getLogger(__name__)


def map_copyleaks_hits(
    version_id: UUID,
    hits: list[CopyleaksHit],
    chunks: list[DocumentChunk],
) -> list[PlagiarismMatch]:
    """Convierte una lista de CopyleaksHit en PlagiarismMatch listos para persistir.

    Args:
        version_id: ID de la SubmissionVersion escaneada.
        hits: Lista de hits devuelta por CopyleaksClient.
        chunks: DocumentChunk ya persistidos para version_id, ordenados por chunk_index.

    Returns:
        Lista de PlagiarismMatch con source='copyleaks'. No incluye hits sin ancla.
    """
    if not chunks:
        logger.warning(
            "copyleaks_mapper: no hay chunks para version_id=%s; se descartan %d hits",
            version_id,
            len(hits),
        )
        return []

    matches: list[PlagiarismMatch] = []

    for hit in hits:
        if not hit.matched_text:
            logger.warning("copyleaks_mapper: hit sin texto descartado: %s", hit)
            continue

        source_chunk = _find_chunk(hit.matched_text, chunks)

        if source_chunk is None:
            logger.warning(
                "copyleaks_mapper: matched_text no encontrado en ningún chunk "
                "(posible whitespace reflow); hit descartado. url=%s texto='%.80s'",
                hit.source_url,
                hit.matched_text,
            )
            continue

        # matched_chunk_id y matched_version_id no aplican para Copyleaks
        # (no son submissions internas). Se reutiliza source_chunk_id como
        # matched_chunk_id para satisfacer la FK NOT NULL del modelo.
        match = PlagiarismMatch(
            version_id=version_id,
            matched_version_id=version_id,  # auto-referencia para satisfacer FK
            source_chunk_id=source_chunk.id,
            matched_chunk_id=source_chunk.id,  # mismo chunk; no aplica para copyleaks
            similarity=hit.similarity,
            source=PlagiarismSource.copyleaks,
            status=PlagiarismStatus.pending,
        )
        # Campos extra que el modelo permite como NULL se almacenan en la misma fila.
        # source_url y matched_text no son columnas del modelo actual (se persisten en
        # el futuro como extensión); por ahora se dejan sin persistir en DB.
        # El visor usará source_chunk.text para reconstruir el contexto.
        matches.append(match)

    return matches


def _find_chunk(text: str, chunks: list[DocumentChunk]) -> DocumentChunk | None:
    """Busca el primer chunk cuyo texto contenga la cadena buscada (str.find).

    Normaliza whitespace antes de comparar para mitigar reflow menor.
    """
    import re

    normalized_query = re.sub(r"\s+", " ", text).strip()

    for chunk in chunks:
        normalized_chunk = re.sub(r"\s+", " ", chunk.text)
        if normalized_query in normalized_chunk:
            return chunk

    return None
