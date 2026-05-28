import logging
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from kimy import __version__
from kimy.api.v1 import router as v1_router
from kimy.core.audit import AuditMiddleware
from kimy.core.config import get_settings
from kimy.core.rate_limit import limiter

_timing_logger = logging.getLogger("kimy.timing")
_timing_logger.setLevel(logging.INFO)
# Make sure timing lines hit stdout even if uvicorn's logging config doesn't
# propagate to our namespaced logger. propagate=True + a fallback handler when
# nothing is attached covers both `--log-config` and default setups.
if not _timing_logger.handlers and not logging.getLogger().handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
    _timing_logger.addHandler(_h)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=__version__,
    description=(
        "Tesis — Backend API for academic thesis review with AI evaluation, "
        "plagiarism detection (pgvector), citation validation (CrossRef), "
        "and ORCID-based advisor identity."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Rate limiter wiring.
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(_request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "rate limit exceeded", "limit": str(exc.detail)},
    )


# Per-request timing. Logs every request as `METHOD path -> status (Xms)`.
# Useful for spotting slow endpoints in dev when the uvicorn access log only
# prints method+path+status. Skips /health to keep the noise down. Also
# attaches an `X-Process-Time` header so the frontend can read latency from
# the browser DevTools without server-side parsing.
class RequestTimingMiddleware(BaseHTTPMiddleware):
    _SKIP = {"/health", "/"}
    _SLOW_THRESHOLD_MS = 500

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        if request.url.path in self._SKIP:
            return await call_next(request)
        started = time.perf_counter()
        response: Response = await call_next(request)
        duration_ms = (time.perf_counter() - started) * 1000
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.1f}"
        marker = " SLOW" if duration_ms >= self._SLOW_THRESHOLD_MS else ""
        _timing_logger.info(
            "%s %s -> %d (%.1fms)%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            marker,
        )
        return response


# Security headers: belt-and-suspenders defaults that hurt nobody.
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        response: Response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault(
            "Permissions-Policy",
            "geolocation=(), microphone=(), camera=()",
        )
        if request.url.scheme == "https":
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(AuditMiddleware)
# Timing middleware sits closest to the response so the measured duration
# reflects what the client actually waits on (including audit + security
# headers). Middlewares run outside-in on request, inside-out on response;
# adding last means it's the outermost on the response path.
app.add_middleware(RequestTimingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    # Expose the timing header so the browser DevTools / fetch responses can
    # read it; otherwise CORS hides any custom response header by default.
    expose_headers=["X-Process-Time-Ms"],
    # Browsers cache preflight responses for this many seconds. Without it (or
    # with a wildcard methods/headers config) every cross-origin call triggers
    # an OPTIONS round-trip, which is the biggest hidden tax on page loads.
    max_age=600,
)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": __version__,
    }


@app.get("/", tags=["meta"])
async def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "version": __version__,
        "docs": "/docs",
    }


app.include_router(v1_router)
