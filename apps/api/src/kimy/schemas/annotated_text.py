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


class PageMatch(BaseModel):
    """Fragmento coincidente listo para resaltar sobre el PDF original.

    A diferencia de SpanItem (offsets sobre texto ensamblado), PageMatch
    expone el texto crudo y el numero de pagina para que el visor PDF
    busque y resalte el fragmento sobre la capa de texto de pdf.js.
    """

    match_id: UUID
    matched_text: str
    similarity: float
    page_number: int | None
    source_url: str | None


class AnnotatedTextResponse(BaseModel):
    """Respuesta del endpoint GET /submissions/{sid}/versions/{vid}/annotated-text."""

    version_id: UUID
    filename: str
    # True si el documento original es un PDF renderizable en el visor.
    is_pdf: bool
    text: str
    spans: list[SpanItem]
    matches: list[PageMatch]
