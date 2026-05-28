from __future__ import annotations

import asyncio
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from kimy.core.security import hash_password, verify_password
from kimy.models.advisor_profile import AdvisorProfile
from kimy.models.student_profile import StudentProfile
from kimy.models.user import User, UserRole


class EmailAlreadyExistsError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InactiveUserError(Exception):
    pass


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email.lower())
    return (await session.execute(stmt)).scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: UUID) -> User | None:
    return await session.get(User, user_id)


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    full_name: str,
    role: UserRole,
) -> User:
    normalized_email = email.lower().strip()
    if await get_user_by_email(session, normalized_email):
        raise EmailAlreadyExistsError(normalized_email)

    # Argon2 hashing is CPU-bound (~100ms at default cost). Pushing it to a
    # worker thread keeps the event loop responsive for every other request.
    password_hash = await asyncio.to_thread(hash_password, password)
    user = User(
        email=normalized_email,
        password_hash=password_hash,
        full_name=full_name.strip(),
        role=role,
        is_active=True,
    )
    session.add(user)
    await session.flush()

    if role == UserRole.student:
        session.add(StudentProfile(user_id=user.id))
    elif role == UserRole.advisor:
        session.add(AdvisorProfile(user_id=user.id))

    await session.commit()
    await session.refresh(user)
    return user


async def authenticate(
    session: AsyncSession,
    *,
    email: str,
    password: str,
) -> User:
    user = await get_user_by_email(session, email.lower().strip())
    if user is None:
        raise InvalidCredentialsError
    # Argon2 verify is CPU-bound (~50ms). Off-thread it so a single login
    # attempt doesn't stall every other request on the same worker.
    ok = await asyncio.to_thread(verify_password, password, user.password_hash)
    if not ok:
        raise InvalidCredentialsError
    if not user.is_active:
        raise InactiveUserError
    return user
