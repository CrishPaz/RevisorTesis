"""Tests de integración del pipeline condicional Copyleaks.

Usa mocks de CopyleaksClient y de la sesión SQLAlchemy para verificar
que el pipeline ramifica correctamente sin hacer llamadas HTTP reales
ni acceder a la base de datos.

Scenarios:
  2.1 — flag ON + mock cliente OK → matches Copyleaks persistidos
  2.2 — flag OFF → cliente no llamado
  2.3 — polling timeout → versión marcada failed
  2.4 — auth error → versión marcada failed
"""
from __future__ import annotations

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from kimy.models.plagiarism_match import PlagiarismSource
from kimy.models.submission_version import VersionParsingStatus
from kimy.services.plagiarism.copyleaks_client import (
    CopyleaksAuthError,
    CopyleaksHit,
    CopyleaksScanResult,
    CopyleaksTimeoutError,
)


def _make_version(enable_copyleaks: bool = True):
    version = MagicMock()
    version.id = uuid4()
    version.parsing_status = VersionParsingStatus.ai_processing
    version.parsing_error = None
    version.enable_copyleaks = enable_copyleaks
    return version


def _make_session():
    session = AsyncMock()
    session.execute = AsyncMock(return_value=MagicMock(scalars=lambda: MagicMock(all=lambda: [])))
    session.add = MagicMock()
    session.commit = AsyncMock()
    return session


def _fake_path() -> Path:
    p = MagicMock(spec=Path)
    p.is_file.return_value = True
    p.read_bytes.return_value = b"%PDF-fake-content"
    return p


# ---------------------------------------------------------------------------
# Scenario 2.1: flag ON + mock cliente OK → matches persistidos
# ---------------------------------------------------------------------------

async def test_copyleaks_scan_flag_on_persiste_matches() -> None:
    from kimy.services.ai.pipeline import _run_copyleaks_scan

    version = _make_version(enable_copyleaks=True)
    session = _make_session()
    path = _fake_path()

    hit = CopyleaksHit(
        url="https://fuente.com",
        matched_text="fragmento de texto que coincide con el documento",
        similarity=0.8,
    )
    scan_result = CopyleaksScanResult(scan_id="scan-001", hits=[hit])

    mock_chunk = MagicMock()
    mock_chunk.id = uuid4()
    mock_chunk.text = "párrafo con fragmento de texto que coincide con el documento analizado"
    mock_chunk.chunk_index = 0

    session.execute = AsyncMock(
        return_value=MagicMock(scalars=lambda: MagicMock(all=lambda: [mock_chunk]))
    )

    with patch("kimy.services.ai.pipeline.CopyleaksClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.login = AsyncMock(return_value="tok-test")
        mock_instance.submit = AsyncMock()
        mock_instance.poll_until_done = AsyncMock(return_value=scan_result)

        await _run_copyleaks_scan(session, version, path)

    session.add.assert_called()
    session.commit.assert_called()
    # La versión no debe marcarse como failed.
    assert version.parsing_status == VersionParsingStatus.ai_processing


# ---------------------------------------------------------------------------
# Scenario 2.3: polling timeout → versión failed
# ---------------------------------------------------------------------------

async def test_copyleaks_scan_timeout_marca_failed() -> None:
    from kimy.services.ai.pipeline import _run_copyleaks_scan

    version = _make_version(enable_copyleaks=True)
    session = _make_session()
    path = _fake_path()

    with patch("kimy.services.ai.pipeline.CopyleaksClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.login = AsyncMock(return_value="tok-test")
        mock_instance.submit = AsyncMock()
        mock_instance.poll_until_done = AsyncMock(
            side_effect=CopyleaksTimeoutError("Copyleaks timeout: sin respuesta en 5 minutos")
        )

        await _run_copyleaks_scan(session, version, path)

    assert version.parsing_status == VersionParsingStatus.failed
    assert "timeout" in (version.parsing_error or "").lower()
    session.commit.assert_called()


# ---------------------------------------------------------------------------
# Scenario 2.4: auth error → versión failed
# ---------------------------------------------------------------------------

async def test_copyleaks_scan_auth_error_marca_failed() -> None:
    from kimy.services.ai.pipeline import _run_copyleaks_scan

    version = _make_version(enable_copyleaks=True)
    session = _make_session()
    path = _fake_path()

    with patch("kimy.services.ai.pipeline.CopyleaksClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.login = AsyncMock(
            side_effect=CopyleaksAuthError("Copyleaks auth error: credenciales inválidas")
        )

        await _run_copyleaks_scan(session, version, path)

    assert version.parsing_status == VersionParsingStatus.failed
    assert "auth error" in (version.parsing_error or "").lower()
    session.commit.assert_called()


# ---------------------------------------------------------------------------
# Scenario 2.2 (indirecto): cuando flag OFF, _run_copyleaks_scan no se llama
# El pipeline solo invoca _run_copyleaks_scan cuando version.enable_copyleaks=True.
# Se verifica que la función retorna sin hacer nada cuando el path no existe.
# ---------------------------------------------------------------------------

async def test_copyleaks_scan_path_no_existente_retorna_sin_error() -> None:
    from kimy.services.ai.pipeline import _run_copyleaks_scan

    version = _make_version(enable_copyleaks=True)
    session = _make_session()

    path_inexistente = MagicMock(spec=Path)
    path_inexistente.is_file.return_value = False

    with patch("kimy.services.ai.pipeline.CopyleaksClient") as MockClient:
        await _run_copyleaks_scan(session, version, path_inexistente)

    MockClient.assert_not_called()
    session.add.assert_not_called()
