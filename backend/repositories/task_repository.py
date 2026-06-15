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
    task_data["created_at"] = now
    task_data["updated_at"] = now
    task_data["is_active"] = True
    task_data["version"] = 1
    result = collection.insert_one(task_data)
    return str(result.inserted_id)


def get_all_tasks(user_id: str, include_inactive: bool = False) -> list:
    query = {"user_id": user_id}
    if not include_inactive:
        query["is_active"] = True

    tasks = []
    for task in collection.find(query):
        tasks.append(serialize_task(_stringify_id(task)))
    return tasks


def get_task_by_id(task_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    query = {"_id": ObjectId(task_id)}
    if user_id is not None:
        query["user_id"] = user_id

    task = collection.find_one(query)
    if not task:
        return None
    return serialize_task(_stringify_id(task))


def get_task_document(task_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    query = {"_id": ObjectId(task_id)}
    if user_id is not None:
        query["user_id"] = user_id

    task = collection.find_one(query)
    if not task:
        return None
    return _stringify_id(task)


def update_task(task_id: str, task_data: dict) -> Optional[dict]:
    collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": task_data},
    )
    return get_task_by_id(task_id)


def soft_delete_task(task_id: str) -> Optional[dict]:
    now = _utc_now()
    collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"is_active": False, "updated_at": now}},
    )
    return get_task_by_id(task_id)
