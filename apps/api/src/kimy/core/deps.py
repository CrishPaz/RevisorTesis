from __future__ import annotations

import time
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from kimy.core.security import decode_token
from kimy.db.session import get_session
from kimy.models.user import User, UserRole
from kimy.services.users import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]


# In-process TTL cache for the resolved CurrentUser. Without it, EVERY
# authenticated request did a `SELECT users WHERE id = ?`, which is a few
# milliseconds per call but adds up fast in a dashboard that makes 10+ parallel
# requests on view load. 5 minutes is short enough that role/is_active changes
# propagate quickly during normal admin work, and admin patch_user explicitly
# invalidates the cache so privilege changes never wait out the TTL.
_USER_CACHE_TTL = 300.0
_USER_CACHE_MAX = 2048
_user_cache: dict[UUID, tuple[float, User]] = {}


def invalidate_user_cache(user_id: UUID | None = None) -> None:
    """Drop one or all entries from the resolved-user cache."""
    if user_id is None:
        _user_cache.clear()
        return
    _user_cache.pop(user_id, None)


def _cache_get(user_id: UUID) -> User | None:
    entry = _user_cache.get(user_id)
    if entry is None:
        return None
    expires_at, user = entry
    if expires_at < time.monotonic():
        _user_cache.pop(user_id, None)
        return None
    return user


def _cache_put(user: User) -> None:
    if len(_user_cache) >= _USER_CACHE_MAX:
        # Drop the oldest entry — dict preserves insertion order.
        oldest_key = next(iter(_user_cache))
        _user_cache.pop(oldest_key, None)
    _user_cache[user.id] = (time.monotonic() + _USER_CACHE_TTL, user)


async def get_current_user(
    session: SessionDep,
    creds: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ] = None,
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(creds.credentials, expected_type="access")
        user_id = UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    cached = _cache_get(user_id)
    if cached is not None:
        return cached

    user = await get_user_by_id(session, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="user not found or inactive",
        )
    # SQLAlchemy objects expire when their session closes. Detach so the cached
    # copy stays usable across sessions — read-only access is what dependents do.
    session.expunge(user)
    _cache_put(user)
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*allowed: UserRole):
    async def _checker(user: CurrentUser) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"role '{user.role.value}' not allowed",
            )
        return user

    return _checker
