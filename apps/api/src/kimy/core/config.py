from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Tesis API"
    app_version: str = "0.1.0"
    environment: str = Field(default="development")
    debug: bool = True

    # SQLAlchemy `echo` prints every statement + bound params to stdout. Useful
    # for debugging a specific query, but in Windows + uvicorn dev the stdout
    # write is synchronous and adds ~200-500ms per query — enough to make the
    # dashboard feel sluggish even when the DB is fast. Keep it OFF by default
    # and flip it on via env var when you actually need to read SQL.
    sql_echo: bool = False

    # Force NullPool even outside production. Set to True only when you hit the
    # "Future attached to a different loop" error with uvicorn --reload — most
    # of the time you want the pool ON in dev too, because asyncpg on Windows
    # takes ~5s per fresh connection (DNS / loopback handshake), which crushes
    # every request when NullPool opens a new socket each time.
    db_force_null_pool: bool = False

    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    database_url: str = "postgresql+asyncpg://kimy:kimy@localhost:5433/kimy"
    redis_url: str = "redis://localhost:6379/0"

    # Minimum 32 bytes for HS256 (RFC 7518 §3.2). Override in production.
    jwt_secret: str = "dev-only-secret-change-me-32bytes-min-padding-padding"  # noqa: S105
    encryption_key: str = "change-me-in-prod-32-bytes-base64-fernet="  # noqa: S105

    # Primary LLM provider: Google Gemini (via google-genai SDK).
    gemini_api_key: str | None = None
    # Legacy / fallback LLM providers — optional.
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None

    orcid_client_id: str | None = None
    orcid_client_secret: str | None = None
    orcid_redirect_uri: str = "http://localhost:3000/orcid/callback"
    # Use ORCID sandbox by default (sandbox.orcid.org). Set to false for prod.
    orcid_sandbox: bool = True

    # Cosine similarity below this is flagged as a poor advisor↔thesis match.
    # 0.35 is calibrated for the hashed-BoW embedder; raise to ~0.50 when running
    # with OpenAI text-embedding-3-small (which discriminates more sharply).
    orcid_advisor_fit_threshold: float = 0.35

    crossref_user_agent: str = "Tesis/0.1 (mailto:contact@example.com)"

    storage_backend: str = "local"
    storage_path: str = "./storage"

    # ---- SMTP (advisor sends acta PDF by email) ----
    # Gmail: use smtp.gmail.com:587 with an App Password (NOT your normal pwd).
    # https://support.google.com/accounts/answer/185833
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str = "Plataforma Tesis"
    smtp_use_tls: bool = True  # STARTTLS on port 587. Set to False + port 465 for SSL.

    # ---- Copyleaks (external plagiarism detection) ----
    # Register at https://copyleaks.com — free academic tier available.
    # Leave blank to disable Copyleaks integration; versions with
    # enable_copyleaks=True will fail with a descriptive auth error.
    copyleaks_email: str = ""
    copyleaks_api_key: SecretStr = SecretStr("")
    # URL publica donde Copyleaks notificara los estados del scan.
    # El servicio exige una webhook URL aunque despues hagamos polling.
    # Para desarrollo local sin tunel, usar un placeholder de webhook.site.
    copyleaks_webhook_url: str = "https://webhook.site/00000000-0000-0000-0000-000000000000"
    # Modo sandbox: scans gratis (max 100/hora) que no consumen creditos.
    # Activar solo si la cuenta esta autenticada en modo sandbox.
    copyleaks_sandbox: bool = False
    # Seconds between polling attempts while waiting for Copyleaks results.
    copyleaks_polling_interval_sec: int = 15
    # Maximum seconds to wait for a Copyleaks scan before marking the version failed.
    copyleaks_timeout_sec: int = 300


@lru_cache
def get_settings() -> Settings:
    return Settings()
