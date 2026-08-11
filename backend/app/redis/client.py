import hashlib
import json
from typing import Any

import redis

from app.core.config import settings

_client: redis.Redis | None = None


def get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
    return _client


def _key(features: dict[str, Any]) -> str:
    payload = json.dumps(features, sort_keys=True, default=str)
    return "prediction:" + hashlib.sha256(payload.encode()).hexdigest()


def get_cached_prediction(features: dict[str, Any]) -> dict | None:
    try:
        cached = get_client().get(_key(features))
        return json.loads(cached) if cached else None
    except Exception:
        return None  # Redis недоступен — просто работаем без кэша


def set_cached_prediction(features: dict[str, Any], result: dict[str, Any]) -> None:
    try:
        get_client().set(_key(features), json.dumps(result), ex=settings.CACHE_TTL_SECONDS)
    except Exception:
        pass