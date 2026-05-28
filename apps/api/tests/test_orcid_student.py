"""Validación liviana de ORCID para el estudiante.

Corre en stub mode (sin ORCID_CLIENT_ID/SECRET en el entorno de tests), así
que el flow no toca la red — usa el ``_stub_profile`` determinístico.
"""
from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import auth_headers, register_user


# ORCID iD real con checksum válido (mod-11-2). Lo reusamos en happy paths.
VALID_ORCID = "0000-0002-1825-0097"
INVALID_CHECKSUM = "0000-0002-1825-0098"
BAD_FORMAT = "abcd-1234-5678-9012"


def test_student_status_starts_unlinked(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    response = client.get(
        "/api/v1/orcid/student/me", headers=auth_headers(token)
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["linked"] is False
    assert data["orcid_id"] is None
    assert data["publications_count"] == 0
    assert data["mode"] in ("real", "stub")


def test_student_validates_orcid_happy_path(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    response = client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": VALID_ORCID},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["linked"] is True
    assert data["orcid_id"] == VALID_ORCID
    assert data["full_name"]
    assert data["affiliation"]
    assert data["publications_count"] >= 1


def test_student_validate_rejects_bad_format(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    response = client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": BAD_FORMAT},
    )
    assert response.status_code == 400
    assert "format" in response.json()["detail"].lower() or "inv" in response.json()["detail"].lower()


def test_student_validate_rejects_bad_checksum(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    response = client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": INVALID_CHECKSUM},
    )
    assert response.status_code == 400


def test_student_publications_returned_after_validate(
    client: TestClient,
) -> None:
    _, token = register_user(client, role="student")
    validate = client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": VALID_ORCID},
    )
    assert validate.status_code == 200

    pubs = client.get(
        "/api/v1/orcid/student/me/publications",
        headers=auth_headers(token),
    )
    assert pubs.status_code == 200
    items = pubs.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    sample = items[0]
    assert "title" in sample
    assert "put_code" in sample


def test_student_unlink_clears_state(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": VALID_ORCID},
    )
    unlink = client.delete(
        "/api/v1/orcid/student/me", headers=auth_headers(token)
    )
    assert unlink.status_code == 204

    after = client.get(
        "/api/v1/orcid/student/me", headers=auth_headers(token)
    ).json()
    assert after["linked"] is False
    assert after["orcid_id"] is None
    assert after["publications_count"] == 0


def test_advisor_cannot_use_student_endpoints(client: TestClient) -> None:
    _, token = register_user(client, role="advisor")
    response = client.post(
        "/api/v1/orcid/student/validate",
        headers=auth_headers(token),
        json={"orcid_id": VALID_ORCID},
    )
    assert response.status_code == 403


def test_student_cannot_use_advisor_endpoints(client: TestClient) -> None:
    _, token = register_user(client, role="student")
    response = client.post(
        "/api/v1/orcid/authorize", headers=auth_headers(token)
    )
    assert response.status_code == 403
