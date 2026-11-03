import logging
from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError, PyJWTError

from app.core.config import get_settings

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def _jwks_client() -> PyJWKClient:
    return PyJWKClient(get_settings().supabase_jwks_url)


def get_current_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный или отсутствующий токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    settings = get_settings()
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(credentials.credentials)
        claims = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=[settings.supabase_jwt_algorithm],
            audience=settings.supabase_jwt_audience,
            issuer=settings.supabase_issuer,
        )
    except (PyJWTError, PyJWKClientError) as error:
        logger.warning(
            "Supabase access token rejected (%s)",
            type(error).__name__,
        )
        raise unauthorized from error

    if not claims.get("sub") or not claims.get("email"):
        logger.warning("Supabase access token rejected (missing sub or email claim)")
        raise unauthorized
    return claims


def get_admin_claims(
    claims: dict[str, Any] = Depends(get_current_claims),
) -> dict[str, Any]:
    admin_user_ids = get_settings().admin_user_id_set
    if claims["sub"] not in admin_user_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для этого действия",
        )
    return claims
