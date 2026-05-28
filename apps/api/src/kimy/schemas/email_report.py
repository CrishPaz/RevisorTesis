"""Schema para el endpoint email-report extendido.

report_type con default "acta" garantiza backward compatibility:
clientes que no envíen el campo reciben el mismo comportamiento de antes.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class EmailReportRequest(BaseModel):
    to: str = Field(min_length=3, max_length=320)
    message: str | None = Field(default=None, max_length=2000)
    report_type: Literal["acta", "plagiarism", "both"] = "acta"
