"""Tests unitarios de extract_from_pdf: propagación de page_number.

No necesita un PDF real — se construye uno mínimo en memoria con reportlab
para que pypdf pueda extraer texto de páginas concretas.
"""
from __future__ import annotations

from io import BytesIO

import pytest

from kimy.services.documents.extractor import ExtractedParagraph, extract_from_pdf


def _make_pdf_bytes(pages: list[str]) -> bytes:
    """Genera un PDF mínimo con N páginas, cada una conteniendo el texto indicado."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen.canvas import Canvas
    except ImportError:
        pytest.skip("reportlab no disponible para generar PDF de prueba")

    buf = BytesIO()
    c = Canvas(buf, pagesize=A4)
    for text in pages:
        c.drawString(72, 700, text)
        c.showPage()
    c.save()
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Scenario 3.1: PDF de múltiples páginas — page_number propagado correctamente
# ---------------------------------------------------------------------------

def test_extractor_propaga_page_number_multipage() -> None:
    """Párrafos de cada página llevan el número de página 1-based correcto."""
    textos = [
        "Contenido pagina uno",
        "Contenido pagina dos",
        "Contenido pagina tres",
    ]
    pdf_bytes = _make_pdf_bytes(textos)
    doc = extract_from_pdf(pdf_bytes)

    assert doc.page_count == 3

    # Cada párrafo no vacío debe tener page_number en {1, 2, 3}.
    page_numbers = {p.page_number for p in doc.paragraphs if p.text}
    assert page_numbers.issubset({1, 2, 3})
    assert page_numbers  # al menos uno

    # Los párrafos de la primera página deben tener page_number == 1.
    primeros = [p for p in doc.paragraphs if p.page_number == 1]
    assert primeros, "Debe haber al menos un párrafo de la página 1"

    terceros = [p for p in doc.paragraphs if p.page_number == 3]
    assert terceros, "Debe haber al menos un párrafo de la página 3"


def test_extractor_page_number_es_1based() -> None:
    """El primer número de página debe ser 1, no 0."""
    pdf_bytes = _make_pdf_bytes(["Solo una pagina con texto"])
    doc = extract_from_pdf(pdf_bytes)

    numeros = [p.page_number for p in doc.paragraphs if p.page_number is not None]
    assert all(n >= 1 for n in numeros)


def test_extractor_docx_no_tiene_page_number() -> None:
    """ExtractedParagraph de docx tiene page_number=None (degradación graceful)."""
    para = ExtractedParagraph(text="texto", heading_level=None)
    assert para.page_number is None
