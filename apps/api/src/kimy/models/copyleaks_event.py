"""Tabla de staging para los webhooks crudos de Copyleaks.

n8n recibe los webhooks asíncronos de Copyleaks (completed, crawled, result)
y vuelca el payload CRUDO aquí mediante un INSERT directo. n8n nunca interpreta
los offsets ni toca el esquema de negocio: solo persiste lo que Copyleaks envía.

El backend (que alcanza esta misma base desplegada) pollea esta tabla por
``version_id`` hasta tener el set completo de eventos de un scan, ejecuta la
extracción de spans en Python y recién entonces escribe ``plagiarism_matches``.

Ver docs/copyleaks-n8n/README.md para el flujo completo.
"""
from __future__ import annotations

import enum
from typing import Any

from sqlalchemy import Boolean, Enum, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from kimy.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CopyleaksEventType(str, enum.Enum):
    """Tipo de webhook recibido desde Copyleaks (vía n8n)."""

    completed = "completed"   # webhook de estado: scan terminado, trae result IDs
    error = "error"           # webhook de estado: scan falló
    crawled = "crawled"       # export: texto plano del documento escaneado
    result = "result"         # export: detalle de un match (offsets de caracteres)


class CopyleaksEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Evento crudo de Copyleaks a la espera de ser procesado por el backend."""

    __tablename__ = "copyleaks_events"

    # version_id == scanId enviado a Copyleaks. Correlaciona el evento con la
    # SubmissionVersion. No es FK estricta para que n8n pueda insertar sin
    # dependencias de carga y para no bloquear si la versión se borra.
    version_id: Mapped[Any] = mapped_column(
        PgUUID(as_uuid=True), nullable=False, index=True
    )
    scan_id: Mapped[str] = mapped_column(String(64), nullable=False)

    event_type: Mapped[CopyleaksEventType] = mapped_column(
        Enum(CopyleaksEventType, name="copyleaks_event_type"),
        nullable=False,
    )
    # Solo para event_type == result: el id del resultado exportado.
    result_id: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # Payload crudo tal cual lo manda Copyleaks. El backend lo interpreta.
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    # El poller del backend marca processed=True cuando ya generó los matches.
    processed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    __table_args__ = (
        # Índice parcial: el poller busca eventos sin procesar por versión.
        Index(
            "ix_copyleaks_events_pending",
            "version_id",
            "event_type",
            postgresql_where=(processed.is_(False)),  # type: ignore[arg-type]
        ),
    )
