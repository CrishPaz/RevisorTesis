"""Schemas para el endpoint annotated-text.

SpanItem representa un fragmento de texto con coincidencia de plagio,
delimitado por offsets de caracteres dentro del texto ensamblado.
"""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class SpanItem(BaseModel):
    """Posición de un fragmento coincidente en el texto ensamblado."""

    start: int
    end: int
    match_id: UUID
    source: str
    similarity: float
    page_number: int | None
    source_url: str | None


class AnnotatedTextResponse(BaseModel):
    """Respuesta del endpoint GET /submissions/{sid}/versions/{vid}/annotated-text."""

    version_id: UUID
    text: str
    spans: list[SpanItem]
