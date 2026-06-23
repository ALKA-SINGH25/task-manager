from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from database import db
from models.task import serialize_task

collection = db["tasks"]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _stringify_id(document: dict) -> dict:
    document["_id"] = str(document["_id"])
    return document


def create_task(task_data: dict) -> str:
    now = _utc_now()
    new_id = ObjectId()
    task_data["_id"] = new_id
    task_data["task_group_id"] = str(new_id)
    task_data["created_at"] = now
    task_data["updated_at"] = now
    task_data["version"] = 1
    task_data["is_latest"] = True
    
    # Remove is_active if it was accidentally passed
    if "is_active" in task_data:
        del task_data["is_active"]
        
    collection.insert_one(task_data)
    
    user_id = task_data.get("user_id")
    if user_id:
        from core.redis_client import invalidate_cache
        invalidate_cache(f"tasks:{user_id}")
        invalidate_cache(f"task_history:{str(new_id)}")
        
    return str(new_id)


def get_all_tasks(user_id: str) -> list:
    from core.redis_client import get_cache, set_cache
    import logging
    logger = logging.getLogger(__name__)

    cache_key = f"tasks:{user_id}"
    cached_data = get_cache(cache_key)
    if cached_data is not None:
        return cached_data
        
    logger.info("CACHE MISS")
    
    # include_inactive is no longer applicable with the new schema, we only return is_latest: True
    query = {"user_id": user_id, "is_latest": True}

    tasks = []
    for task in collection.find(query):
        tasks.append(serialize_task(_stringify_id(task)))
        
    set_cache(cache_key, tasks, ttl=300)
    return tasks


def get_task_by_id(task_group_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    query = {"task_group_id": task_group_id, "is_latest": True}
    if user_id is not None:
        query["user_id"] = user_id

    task = collection.find_one(query)
    if not task:
        return None
    return serialize_task(_stringify_id(task))


def get_task_document(task_group_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    query = {"task_group_id": task_group_id, "is_latest": True}
    if user_id is not None:
        query["user_id"] = user_id

    task = collection.find_one(query)
    if not task:
        return None
    return _stringify_id(task)


def update_task(task_group_id: str, task_data: dict) -> Optional[dict]:
    # Atomically find the latest and set is_latest = False
    old_task = collection.find_one_and_update(
        {"task_group_id": task_group_id, "is_latest": True},
        {"$set": {"is_latest": False}}
    )
    if not old_task:
        return None

    # Prepare new task version
    new_task = old_task.copy()
    if "_id" in new_task:
        del new_task["_id"] # generate a new ObjectId
    
    # Remove is_active from old task if it existed
    if "is_active" in new_task:
        del new_task["is_active"]
        
    new_task.update(task_data)
    new_task["task_group_id"] = task_group_id
    new_task["is_latest"] = True
    new_task["version"] = old_task.get("version", 1) + 1
    new_task["updated_at"] = _utc_now()
    
    collection.insert_one(new_task)
    
    user_id = old_task.get("user_id")
    if user_id:
        from core.redis_client import invalidate_cache
        invalidate_cache(f"tasks:{user_id}")
        invalidate_cache(f"task_history:{task_group_id}")
        
    return get_task_by_id(task_group_id)


def soft_delete_task(task_group_id: str) -> Optional[dict]:
    # To delete a task, we simply find the latest version and set is_latest = False.
    # No new version is created. It will no longer show up in get_all_tasks.
    # Let's return the old task that was just "deleted" (hidden).
    old_task = collection.find_one_and_update(
        {"task_group_id": task_group_id, "is_latest": True},
        {"$set": {"is_latest": False, "updated_at": _utc_now()}}
    )
    if not old_task:
        return None
        
    old_task["is_latest"] = False
    
    user_id = old_task.get("user_id")
    if user_id:
        from core.redis_client import invalidate_cache
        invalidate_cache(f"tasks:{user_id}")
        invalidate_cache(f"task_history:{task_group_id}")
        
    return serialize_task(_stringify_id(old_task))


def get_history_by_task_group_id(task_group_id: str) -> list:
    from core.redis_client import get_cache, set_cache
    import logging
    logger = logging.getLogger(__name__)

    cache_key = f"task_history:{task_group_id}"
    cached_data = get_cache(cache_key)
    if cached_data is not None:
        return cached_data

    logger.info("CACHE MISS")

    records = []
    for record in collection.find({"task_group_id": task_group_id}).sort("version", -1):
        records.append(serialize_task(_stringify_id(record)))
        
    set_cache(cache_key, records, ttl=600)
    return records
