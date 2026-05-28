"""Lookup público de ORCID — 2-legged / client_credentials.

A diferencia del flow del asesor (3-legged, prueba ownership), acá el
estudiante simplemente pega su ORCID iD y nosotros consultamos su perfil
PÚBLICO usando un token ``read-public`` obtenido vía client_credentials. NO
prueba que el estudiante sea el dueño del iD, solo que existe y es público.

Modos:
- **real**: cuando hay ``orcid_client_id`` + ``orcid_client_secret`` en config,
  obtenemos un read-public token cacheado y golpeamos la API pública v3.0.
- **stub**: sin credenciales, devolvemos una persona + works sintéticos
  determinísticos por iD. Útil para tests y dev.
"""
from __future__ import annotations

import asyncio
import logging
import re
import time
from dataclasses import dataclass

import httpx

from kimy.core.config import get_settings
from kimy.services.orcid.api_client import OrcidPerson, OrcidWork

logger = logging.getLogger(__name__)


class OrcidLookupError(Exception):
    """Falla recuperable: iD no encontrado, formato inválido, API caída."""


_ORCID_RE = re.compile(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$")


def normalize_orcid_id(raw: str) -> str:
    """Normaliza: trim, upper-case del checksum, valida formato + mod-11-2."""
    candidate = (raw or "").strip().upper()
    if not _ORCID_RE.fullmatch(candidate):
        raise OrcidLookupError(
            "Formato inválido. Debe ser 0000-0000-0000-000X"
        )
    if not _is_valid_checksum(candidate):
        raise OrcidLookupError("El checksum del ORCID iD no es válido")
    return candidate


def _is_valid_checksum(orcid_id: str) -> bool:
    """ISO 7064 mod-11-2 — el último dígito (o X) es el checksum."""
    digits = orcid_id.replace("-", "")
    total = 0
    for ch in digits[:15]:
        if not ch.isdigit():
            return False
        total = (total + int(ch)) * 2
    remainder = total % 11
    result = (12 - remainder) % 11
    expected = "X" if result == 10 else str(result)
    return digits[15] == expected


def is_real_mode() -> bool:
    settings = get_settings()
    return bool(settings.orcid_client_id and settings.orcid_client_secret)


# Token client_credentials — un solo token para toda la app. ORCID emite
# tokens read-public con TTL muy alto (~20 años), pero igual cacheamos por
# proceso y refresh-eamos preventivamente cuando faltan <30 días.
_token_lock = asyncio.Lock()
_token_cache: dict[str, float | str] = {}
_TOKEN_REFRESH_BEFORE = 30 * 24 * 60 * 60  # 30 días


def _reset_token_cache() -> None:
    _token_cache.clear()


async def _get_read_public_token() -> str:
    async with _token_lock:
        cached = _token_cache.get("token")
        expires_at = _token_cache.get("expires_at", 0.0)
        if isinstance(cached, str) and isinstance(expires_at, float):
            if expires_at - _TOKEN_REFRESH_BEFORE > time.time():
                return cached

        settings = get_settings()
        host = "sandbox.orcid.org" if settings.orcid_sandbox else "orcid.org"
        data = {
            "client_id": settings.orcid_client_id,
            "client_secret": settings.orcid_client_secret,
            "grant_type": "client_credentials",
            "scope": "/read-public",
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"https://{host}/oauth/token",
                data=data,
                headers={"Accept": "application/json"},
            )
        if not resp.is_success:
            raise OrcidLookupError(
                f"No se pudo obtener token read-public: "
                f"{resp.status_code} {resp.text[:200]}"
            )
        payload = resp.json()
        token = payload.get("access_token")
        expires_in = float(payload.get("expires_in") or 0)
        if not token:
            raise OrcidLookupError("ORCID no devolvió access_token")
        _token_cache["token"] = token
        _token_cache["expires_at"] = time.time() + expires_in
        return token


def _api_base() -> str:
    settings = get_settings()
    host = "pub.sandbox.orcid.org" if settings.orcid_sandbox else "pub.orcid.org"
    return f"https://{host}/v3.0"


@dataclass(slots=True)
class PublicProfile:
    orcid_id: str
    person: OrcidPerson
    works: list[OrcidWork]


async def fetch_public_profile(orcid_id: str) -> PublicProfile:
    """Devuelve persona + works usando el read-public token.

    En stub mode devolvemos datos determinísticos derivados del iD.
    """
    normalized = normalize_orcid_id(orcid_id)
    if not is_real_mode():
        return _stub_profile(normalized)

    token = await _get_read_public_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        person_resp, works_resp = await asyncio.gather(
            client.get(f"{_api_base()}/{normalized}/person", headers=headers),
            client.get(f"{_api_base()}/{normalized}/works", headers=headers),
        )

    if person_resp.status_code == 404:
        raise OrcidLookupError("ORCID iD no encontrado")
    if not person_resp.is_success:
        raise OrcidLookupError(
            f"ORCID /person falló: {person_resp.status_code}"
        )
    if not works_resp.is_success:
        # Works puede fallar (perfil sin papers) — lo dejamos vacío.
        logger.warning(
            "ORCID /works fallo para %s: %s", normalized, works_resp.status_code
        )
        works_payload: dict = {}
    else:
        works_payload = works_resp.json()

    person = _parse_person(person_resp.json())
    works = _parse_works(works_payload)
    return PublicProfile(orcid_id=normalized, person=person, works=works)


def _parse_person(payload: dict) -> OrcidPerson:
    name = payload.get("name") or {}
    given = (name.get("given-names") or {}).get("value")
    family = (name.get("family-name") or {}).get("value")
    employments = (payload.get("employments") or {}).get(
        "affiliation-group", []
    )
    affiliation: str | None = None
    if employments:
        first = (employments[0].get("summaries") or [{}])[0]
        org = (first.get("employment-summary") or {}).get("organization") or {}
        affiliation = org.get("name")
    return OrcidPerson(given_name=given, family_name=family, affiliation=affiliation)


def _parse_works(payload: dict) -> list[OrcidWork]:
    works: list[OrcidWork] = []
    for group in payload.get("group", []):
        summaries = group.get("work-summary") or []
        if not summaries:
            continue
        summary = summaries[0]
        title_field = (summary.get("title") or {}).get("title") or {}
        title = title_field.get("value") or ""
        if not title:
            continue

        year_field = (summary.get("publication-date") or {}).get("year") or {}
        year_str = year_field.get("value")
        try:
            year = int(year_str) if year_str else None
        except (TypeError, ValueError):
            year = None

        journal_field = summary.get("journal-title") or {}
        journal = journal_field.get("value")

        external_ids = (summary.get("external-ids") or {}).get("external-id", [])
        doi: str | None = None
        for ext in external_ids:
            if (ext.get("external-id-type") or "").lower() == "doi":
                doi = (ext.get("external-id-value") or "").strip() or None
                break

        url = ((summary.get("url") or {}) or {}).get("value")
        put_code = str(summary.get("put-code") or "")
        if not put_code:
            continue

        works.append(
            OrcidWork(
                put_code=put_code,
                title=title[:500],
                year=year,
                journal=journal[:500] if journal else None,
                doi=doi[:200] if doi else None,
                url=url[:500] if url else None,
            )
        )
    return works


def _stub_profile(orcid_id: str) -> PublicProfile:
    """Perfil sintético para dev/tests cuando no hay credenciales reales."""
    seed = sum(ord(c) for c in orcid_id)
    person = OrcidPerson(
        given_name=f"Estudiante {seed % 100}",
        family_name="Pública",
        affiliation="Universidad de Demostración",
    )
    works = [
        OrcidWork(
            put_code=f"stub-student-{i}",
            title=t,
            year=2023 + (i % 2),
            journal=j,
            doi=f"10.0000/stub-stud.{seed}.{i}",
            url=None,
        )
        for i, (t, j) in enumerate(
            [
                (
                    "Análisis exploratorio de aprendizaje automático en pregrado",
                    "Revista Iberoamericana de Educación",
                ),
                (
                    "Validación de instrumentos en tesis universitarias",
                    "Cuadernos de Investigación Educativa",
                ),
            ],
            start=1,
        )
    ]
    return PublicProfile(orcid_id=orcid_id, person=person, works=works)
