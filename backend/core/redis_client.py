import os
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis package not installed. Redis caching is disabled.")

redis_client = None

def init_redis():
    global redis_client
    if not REDIS_AVAILABLE:
        logger.warning("REDIS UNAVAILABLE")
        return
    
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", 6379))
    password = os.getenv("REDIS_PASSWORD", None)

    try:
        redis_client = redis.Redis(
            host=host,
            port=port,
            password=password,
            decode_responses=True,
            socket_timeout=2,
            socket_connect_timeout=2
        )
        redis_client.ping()
        logger.info("REDIS CONNECTED")
    except Exception as e:
        redis_client = None
        logger.warning("REDIS UNAVAILABLE")

def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            logger.info("CACHE HIT")
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Redis get error: {e}")
    return None

def set_cache(key: str, data: Any, ttl: int = 300):
    if not redis_client:
        return
    try:
        redis_client.setex(key, ttl, json.dumps(data))
    except Exception as e:
        logger.warning(f"Redis set error: {e}")

def invalidate_cache(key: str):
    if not redis_client:
        return
    try:
        redis_client.delete(key)
        logger.info("CACHE INVALIDATED")
    except Exception as e:
        logger.warning(f"Redis delete error: {e}")

def invalidate_cache_pattern(pattern: str):
    if not redis_client:
        return
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info(f"CACHE PATTERN INVALIDATED: {pattern} ({len(keys)} keys)")
    except Exception as e:
        logger.warning(f"Redis pattern delete error: {e}")
