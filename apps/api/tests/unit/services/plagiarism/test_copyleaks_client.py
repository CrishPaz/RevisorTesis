"""Tests unitarios de CopyleaksClient.

Todos los tests usan respx para interceptar las llamadas httpx — ninguna
solicitud real sale a internet. Los Settings se sobreescriben mediante
monkeypatch para controlar credenciales y timeouts sin tocar .env.
"""
from __future__ import annotations

import pytest
import respx
from httpx import Response

from kimy.services.plagiarism.copyleaks_client import (
    CopyleaksAuthError,
    CopyleaksClient,
    CopyleaksTimeoutError,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def client_con_credenciales(monkeypatch) -> CopyleaksClient:
    """CopyleaksClient con credenciales de prueba inyectadas."""
    import kimy.core.config as _cfg
    from pydantic import SecretStr

    settings = _cfg.get_settings()
    monkeypatch.setattr(settings, "copyleaks_email", "test@example.com")
    monkeypatch.setattr(settings, "copyleaks_api_key", SecretStr("test-key-123"))
    monkeypatch.setattr(settings, "copyleaks_polling_interval_sec", 0)
    monkeypatch.setattr(settings, "copyleaks_timeout_sec", 30)

    # Reemplazar la instancia cacheada con la modificada.
    monkeypatch.setattr(_cfg, "get_settings", lambda: settings)

    return CopyleaksClient()


@pytest.fixture()
def client_sin_credenciales(monkeypatch) -> CopyleaksClient:
    """CopyleaksClient con credenciales vacías."""
    import kimy.core.config as _cfg
    from pydantic import SecretStr

    settings = _cfg.get_settings()
    monkeypatch.setattr(settings, "copyleaks_email", "")
    monkeypatch.setattr(settings, "copyleaks_api_key", SecretStr(""))
    monkeypatch.setattr(_cfg, "get_settings", lambda: settings)

    return CopyleaksClient()


# ---------------------------------------------------------------------------
# login()
# ---------------------------------------------------------------------------

@respx.mock
async def test_login_exitoso_retorna_token(client_con_credenciales):
    respx.post("https://api.copyleaks.com/v3/account/login/api-key").mock(
        return_value=Response(200, json={"access_token": "tok-abc123"})
    )

    token = await client_con_credenciales.login()

    assert token == "tok-abc123"


@respx.mock
async def test_login_401_lanza_auth_error(client_con_credenciales):
    respx.post("https://api.copyleaks.com/v3/account/login/api-key").mock(
        return_value=Response(401, json={"message": "Invalid credentials"})
    )

    with pytest.raises(CopyleaksAuthError, match="Copyleaks auth error"):
        await client_con_credenciales.login()


@respx.mock
async def test_login_credenciales_vacias_lanza_auth_error(client_sin_credenciales):
    """No debe llamar a la API cuando las credenciales están vacías."""
    # No configuramos respx mock — si llegara a llamar a la API, fallaría solo.
    with pytest.raises(CopyleaksAuthError, match="no configurados"):
        await client_sin_credenciales.login()


# ---------------------------------------------------------------------------
# submit()
# ---------------------------------------------------------------------------

@respx.mock
async def test_submit_exitoso_no_lanza(client_con_credenciales):
    scan_id = "scan-test-001"
    respx.put(f"https://api.copyleaks.com/v3/scans/submit/file/{scan_id}").mock(
        return_value=Response(200)
    )

    # No debe lanzar excepción.
    await client_con_credenciales.submit(b"%PDF-fake", scan_id=scan_id, token="tok-abc")


@respx.mock
async def test_submit_error_lanza_auth_error(client_con_credenciales):
    scan_id = "scan-test-002"
    respx.put(f"https://api.copyleaks.com/v3/scans/submit/file/{scan_id}").mock(
        return_value=Response(400, json={"message": "Bad request"})
    )

    with pytest.raises(CopyleaksAuthError, match="submit error"):
        await client_con_credenciales.submit(b"%PDF-fake", scan_id=scan_id, token="tok-abc")


# ---------------------------------------------------------------------------
# poll_until_done()
# ---------------------------------------------------------------------------

@respx.mock
async def test_polling_exitoso_en_segunda_iteracion(client_con_credenciales):
    """Primera llamada retorna 404 (sin resultado), segunda retorna resultados."""
    scan_id = "scan-poll-ok"
    url = f"https://api.copyleaks.com/v3/downloads/{scan_id}"

    hits_payload = {
        "results": [
            {
                "matchedText": "fragmento coincidente de prueba",
                "totalWords": 10,
                "matchedWords": 8,
                "url": "https://fuente.example.com/doc",
            }
        ]
    }

    call_count = 0

    def respuesta_dinamica(request):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return Response(404)
        return Response(200, json=hits_payload)

    respx.get(url).mock(side_effect=respuesta_dinamica)

    result = await client_con_credenciales.poll_until_done(
        scan_id, token="tok-abc", timeout_sec=5, interval_sec=0
    )

    assert result.scan_id == scan_id
    assert len(result.hits) == 1
    assert result.hits[0].matched_text == "fragmento coincidente de prueba"
    assert abs(result.hits[0].similarity - 0.8) < 0.01
    assert call_count == 2


@respx.mock
async def test_polling_timeout_lanza_timeout_error(client_con_credenciales):
    """Con timeout=0 y sin resultado inmediato, debe lanzar CopyleaksTimeoutError."""
    scan_id = "scan-poll-timeout"
    url = f"https://api.copyleaks.com/v3/downloads/{scan_id}"

    respx.get(url).mock(return_value=Response(404))

    with pytest.raises(CopyleaksTimeoutError, match="Copyleaks timeout"):
        await client_con_credenciales.poll_until_done(
            scan_id, token="tok-abc", timeout_sec=0, interval_sec=0
        )


@respx.mock
async def test_hits_sin_texto_son_descartados(client_con_credenciales):
    """Hits sin texto no deben incluirse en el resultado."""
    scan_id = "scan-no-text"
    url = f"https://api.copyleaks.com/v3/downloads/{scan_id}"

    payload = {
        "results": [
            {"matchedText": "", "totalWords": 5, "matchedWords": 3, "url": "https://x.com"},
            {"matchedText": "texto valido", "totalWords": 10, "matchedWords": 7, "url": "https://y.com"},
        ]
    }
    respx.get(url).mock(return_value=Response(200, json=payload))

    result = await client_con_credenciales.poll_until_done(
        scan_id, token="tok-abc", timeout_sec=5, interval_sec=0
    )

    assert len(result.hits) == 1
    assert result.hits[0].matched_text == "texto valido"
