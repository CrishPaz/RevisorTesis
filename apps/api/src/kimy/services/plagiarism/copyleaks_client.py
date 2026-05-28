"""Cliente HTTP para la API de Copyleaks.

Encapsula autenticación, envío de documentos y polling de resultados.
Usa httpx.AsyncClient con timeouts explícitos para no bloquear el event loop.
"""
from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field

import httpx

from kimy.core.config import get_settings

logger = logging.getLogger(__name__)

_BASE_URL = "https://api.copyleaks.com"


class CopyleaksAuthError(Exception):
    """Se lanza cuando Copyleaks rechaza las credenciales (HTTP 401/403)."""


class CopyleaksTimeoutError(Exception):
    """Se lanza cuando el polling supera el límite de tiempo configurado."""


@dataclass
class CopyleaksHit:
    """Fragmento coincidente reportado por Copyleaks."""

    url: str
    matched_text: str
    similarity: float
    source_url: str = ""

    def __post_init__(self) -> None:
        # source_url es alias de url; se mantiene por claridad en el mapper.
        if not self.source_url:
            self.source_url = self.url


@dataclass
class CopyleaksScanResult:
    """Resultado consolidado de un escaneo completado."""

    scan_id: str
    hits: list[CopyleaksHit] = field(default_factory=list)


class CopyleaksClient:
    """Interfaz async hacia la API REST de Copyleaks v3.

    Uso típico:
        client = CopyleaksClient()
        token = await client.login()
        await client.submit(pdf_bytes, scan_id=scan_id, token=token)
        result = await client.poll_until_done(scan_id, token=token)
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._email = settings.copyleaks_email
        self._api_key = settings.copyleaks_api_key.get_secret_value()
        self._polling_interval = settings.copyleaks_polling_interval_sec
        self._timeout_sec = settings.copyleaks_timeout_sec

    async def login(self) -> str:
        """Autentica con Copyleaks y retorna el bearer token.

        Raises:
            CopyleaksAuthError: si la API devuelve 401/403 o las credenciales están vacías.
        """
        if not self._email or not self._api_key:
            raise CopyleaksAuthError(
                "Copyleaks auth error: COPYLEAKS_EMAIL o COPYLEAKS_API_KEY no configurados"
            )

        url = f"{_BASE_URL}/v3/account/login/api-key"
        payload = {"email": self._email, "key": self._api_key}

        async with httpx.AsyncClient(timeout=30) as http:
            try:
                response = await http.post(url, json=payload)
            except httpx.HTTPError as exc:
                raise CopyleaksAuthError(f"Copyleaks auth error: {exc}") from exc

        if response.status_code in (401, 403):
            detail = _extract_error(response)
            raise CopyleaksAuthError(f"Copyleaks auth error: {detail}")

        if response.status_code != 200:
            raise CopyleaksAuthError(
                f"Copyleaks auth error: respuesta inesperada {response.status_code}"
            )

        data = response.json()
        token: str = data.get("access_token") or data.get("accessToken", "")
        if not token:
            raise CopyleaksAuthError("Copyleaks auth error: token ausente en respuesta")
        return token

    async def submit(self, pdf_bytes: bytes, scan_id: str, token: str) -> None:
        """Envía un PDF a Copyleaks para análisis.

        Args:
            pdf_bytes: Contenido binario del PDF.
            scan_id: Identificador único para este escaneo (UUID string).
            token: Bearer token obtenido de login().
        """
        url = f"{_BASE_URL}/v3/scans/submit/file/{scan_id}"
        headers = {"Authorization": f"Bearer {token}"}

        # Copyleaks espera multipart con el archivo bajo la clave "file".
        files = {"file": ("document.pdf", pdf_bytes, "application/pdf")}
        properties = {"filename": "document.pdf"}

        async with httpx.AsyncClient(timeout=60) as http:
            response = await http.put(
                url,
                headers=headers,
                files=files,
                data={"properties": str(properties)},
            )

        if response.status_code not in (200, 201):
            raise CopyleaksAuthError(
                f"Copyleaks submit error: HTTP {response.status_code} — {_extract_error(response)}"
            )

    async def get_results(self, scan_id: str, token: str) -> CopyleaksScanResult | None:
        """Descarga resultados de un escaneo.

        Retorna None si el escaneo aún no terminó (estado 'processing').
        """
        url = f"{_BASE_URL}/v3/downloads/{scan_id}"
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(timeout=30) as http:
            response = await http.get(url, headers=headers)

        # 404 o 409 puede indicar que el escaneo todavía está en curso.
        if response.status_code in (404, 409):
            return None

        if response.status_code != 200:
            logger.warning(
                "Copyleaks get_results retornó %s para scan_id=%s",
                response.status_code,
                scan_id,
            )
            return None

        data = response.json()

        # Si el escaneo no completó todavía, la respuesta incluye un campo de estado.
        status = data.get("status", "")
        if status and status.lower() not in ("completed", "done", ""):
            return None

        hits = _parse_hits(data)
        return CopyleaksScanResult(scan_id=scan_id, hits=hits)

    async def poll_until_done(
        self,
        scan_id: str,
        token: str,
        timeout_sec: int | None = None,
        interval_sec: int | None = None,
    ) -> CopyleaksScanResult:
        """Realiza polling hasta obtener resultado o agotar el tiempo límite.

        Args:
            scan_id: Identificador del escaneo.
            token: Bearer token vigente.
            timeout_sec: Segundos máximos de espera (default: settings).
            interval_sec: Segundos entre intentos (default: settings).

        Raises:
            CopyleaksTimeoutError: si se agota el tiempo sin resultado.
        """
        max_wait = timeout_sec if timeout_sec is not None else self._timeout_sec
        interval = interval_sec if interval_sec is not None else self._polling_interval

        deadline = time.monotonic() + max_wait

        while True:
            result = await self.get_results(scan_id, token)
            if result is not None:
                return result

            if time.monotonic() >= deadline:
                raise CopyleaksTimeoutError(
                    f"Copyleaks timeout: sin respuesta en {max_wait // 60} minutos"
                )

            await asyncio.sleep(interval)


def _extract_error(response: httpx.Response) -> str:
    """Extrae un mensaje legible del cuerpo de error de Copyleaks."""
    try:
        body = response.json()
        return body.get("message") or body.get("error") or response.text
    except Exception:  # noqa: BLE001
        return response.text[:200]


def _parse_hits(data: dict) -> list[CopyleaksHit]:
    """Convierte el payload de resultados de Copyleaks en una lista de CopyleaksHit."""
    hits: list[CopyleaksHit] = []

    # La API de Copyleaks puede devolver resultados bajo distintas claves según la versión.
    raw_results = data.get("results") or data.get("matches") or []

    for item in raw_results:
        text = item.get("matchedText") or item.get("text") or ""
        if not text:
            logger.warning("Hit de Copyleaks sin texto; se descarta: %s", item)
            continue

        total_words = max(item.get("totalWords", 1), 1)
        matched_words = item.get("matchedWords", 0)
        similarity = matched_words / total_words

        url = item.get("url") or item.get("sourceUrl") or ""
        hits.append(
            CopyleaksHit(
                url=url,
                matched_text=text,
                similarity=similarity,
            )
        )

    return hits
