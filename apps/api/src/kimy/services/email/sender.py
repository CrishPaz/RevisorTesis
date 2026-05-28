"""SMTP email delivery — used by the advisor flow to send the acta PDF.

Single high-level helper: ``send_with_attachment(to, subject, body_text,
attachment_bytes, attachment_filename)``. Raises :class:`EmailNotConfiguredError`
when SMTP credentials are missing, and :class:`EmailDeliveryError` on any SMTP
failure so the caller can surface a clear message to the user.
"""
from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from kimy.core.config import get_settings

logger = logging.getLogger(__name__)


class EmailNotConfiguredError(RuntimeError):
    """SMTP credentials are missing — the feature is disabled."""


class EmailDeliveryError(RuntimeError):
    """Wraps any aiosmtplib failure with the original cause attached."""


def _build_message(
    *,
    from_addr: str,
    from_name: str,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None,
    attachment_bytes: bytes | None,
    attachment_filename: str | None,
    attachment_mime: str = "application/pdf",
) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = f"{from_name} <{from_addr}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")
    if attachment_bytes is not None and attachment_filename:
        maintype, _, subtype = attachment_mime.partition("/")
        msg.add_attachment(
            attachment_bytes,
            maintype=maintype or "application",
            subtype=subtype or "octet-stream",
            filename=attachment_filename,
        )
    return msg


async def send_with_attachment(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None = None,
    attachment_bytes: bytes | None = None,
    attachment_filename: str | None = None,
    attachment_mime: str = "application/pdf",
) -> None:
    """Send a single email, optionally with one attachment.

    Raises EmailNotConfiguredError if SMTP env vars are missing, and
    EmailDeliveryError on transport failure.
    """
    settings = get_settings()
    if not (
        settings.smtp_host
        and settings.smtp_user
        and settings.smtp_password
        and settings.smtp_from_email
    ):
        raise EmailNotConfiguredError(
            "SMTP credentials missing — set SMTP_HOST, SMTP_USER, SMTP_PASSWORD "
            "and SMTP_FROM_EMAIL in the API environment."
        )

    msg = _build_message(
        from_addr=settings.smtp_from_email,
        from_name=settings.smtp_from_name,
        to=to,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        attachment_bytes=attachment_bytes,
        attachment_filename=attachment_filename,
        attachment_mime=attachment_mime,
    )

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=settings.smtp_use_tls,
            timeout=20,
        )
    except aiosmtplib.SMTPException as exc:
        logger.exception("SMTP delivery failed to=%s subject=%s", to, subject)
        raise EmailDeliveryError(str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 — network errors, DNS, TLS, etc.
        logger.exception("Unexpected error sending email to=%s", to)
        raise EmailDeliveryError(str(exc)) from exc
