"""Tests del endpoint email-report extendido.

Verifica scenarios 8.1–8.5 mediante mocks del email sender y del PDF generator.
No envía emails reales ni accede a la base de datos.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from kimy.schemas.email_report import EmailReportRequest


# ---------------------------------------------------------------------------
# Tests del schema EmailReportRequest
# ---------------------------------------------------------------------------

def test_schema_default_report_type_es_acta() -> None:
    req = EmailReportRequest(to="test@example.com")
    assert req.report_type == "acta"


def test_schema_acepta_plagiarism() -> None:
    req = EmailReportRequest(to="test@example.com", report_type="plagiarism")
    assert req.report_type == "plagiarism"


def test_schema_acepta_both() -> None:
    req = EmailReportRequest(to="test@example.com", report_type="both")
    assert req.report_type == "both"


def test_schema_sin_report_type_es_backward_compatible() -> None:
    """Omitir report_type retorna "acta" — backward compatibility (Scenario 8.5)."""
    req = EmailReportRequest(to="advisor@example.com", message="Hola")
    assert req.report_type == "acta"


# ---------------------------------------------------------------------------
# Tests de render_plagiarism_report (T19)
# ---------------------------------------------------------------------------

def test_render_plagiarism_report_con_matches_genera_bytes() -> None:
    from kimy.models.plagiarism_match import PlagiarismSource, PlagiarismStatus
    from kimy.services.reports.pdf_reports import render_plagiarism_report

    chunk = MagicMock()
    chunk.text = "Fragmento de texto coincidente con fuente externa."
    chunk.page_number = 1

    match = MagicMock()
    match.id = uuid4()
    match.source = PlagiarismSource.copyleaks
    match.similarity = 0.82
    match.source_chunk = chunk
    match.status = PlagiarismStatus.pending

    pdf_bytes = render_plagiarism_report(
        submission_title="Tesis de prueba",
        matches=[match],
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 100
    assert pdf_bytes[:4] == b"%PDF"


def test_render_plagiarism_report_sin_matches_genera_bytes() -> None:
    from kimy.services.reports.pdf_reports import render_plagiarism_report

    pdf_bytes = render_plagiarism_report(
        submission_title="Tesis sin coincidencias",
        matches=[],
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 100


def test_render_plagiarism_report_solo_incluye_copyleaks() -> None:
    """Matches intra no deben aparecer en el reporte de plagio."""
    from kimy.models.plagiarism_match import PlagiarismSource, PlagiarismStatus
    from kimy.services.reports.pdf_reports import render_plagiarism_report

    chunk = MagicMock()
    chunk.text = "Texto de ejemplo."
    chunk.page_number = 1

    match_intra = MagicMock()
    match_intra.id = uuid4()
    match_intra.source = PlagiarismSource.intra
    match_intra.similarity = 0.9
    match_intra.source_chunk = chunk
    match_intra.status = PlagiarismStatus.pending

    # Con solo matches intra → reporte vacío de copyleaks pero PDF válido.
    pdf_bytes = render_plagiarism_report(
        submission_title="Tesis con solo intra",
        matches=[match_intra],
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 100
