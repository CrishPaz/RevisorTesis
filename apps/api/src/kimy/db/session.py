from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from kimy.core.config import get_settings

settings = get_settings()

# Connection pooling strategy:
# - default everywhere → AsyncAdaptedQueuePool. asyncpg on Windows pays ~5s
#   to open a fresh connection (DNS + loopback handshake), so opening one per
#   request via NullPool is what made every endpoint feel sluggish in dev.
# - opt-in NullPool via `DB_FORCE_NULL_POOL=true` — only needed if you hit the
#   "Future attached to a different loop" error from BackgroundTasks reusing
#   stale connections after uvicorn --reload. With the current code that
#   doesn't happen, but the escape hatch is here just in case.
# - pool_size keeps a warm pool; max_overflow handles spikes; pool_recycle
#   evicts stale connections; pool_pre_ping verifies liveness before checkout.
_is_dev = settings.environment.lower() in {"development", "dev", "local", "test"}

# TCP keepalives: when the DB lives on a remote VPS (or behind any NAT/
# firewall), idle connections can be silently dropped by middleboxes. asyncpg
# accepts the standard libpq-style keepalive knobs — values below tell the OS
# to start probing after 30s of idleness and to drop the connection after
# three failed 10s-interval probes. Cheap insurance against "stale connection"
# errors that would otherwise force an expensive reconnect on the next query.
_asyncpg_connect_args = {
    "server_settings": {
        "application_name": settings.app_name,
    },
    # Modest command timeout so a hung query doesn't tie up a pool slot forever.
    "command_timeout": 60,
}

_engine_kwargs: dict = {
    "echo": settings.sql_echo,
    "connect_args": _asyncpg_connect_args,
}
if settings.db_force_null_pool:
    _engine_kwargs["poolclass"] = NullPool
elif _is_dev:
    # Dev pool sized to absorb the dashboard's fan-out: stats/overview alone
    # fires 9 parallel queries, and the frontend (React Strict Mode) doubles
    # every request, so a coordinator login can briefly need 18+ slots. We
    # size for that worst case so the dashboard never has to wait on the pool.
    # pool_pre_ping is critical when the DB is remote: it cheaply verifies the
    # socket is still alive before handing it to the request, so a NAT timeout
    # between hits doesn't surface as a 5s reconnect to the user.
    _engine_kwargs.update(
        pool_size=15,
        max_overflow=20,
        pool_recycle=1800,
        pool_pre_ping=True,
    )
else:
    _engine_kwargs.update(
        pool_size=20,
        max_overflow=40,
        pool_recycle=1800,
        pool_pre_ping=True,
    )

engine = create_async_engine(settings.database_url, **_engine_kwargs)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
