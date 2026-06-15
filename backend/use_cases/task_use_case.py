from datetime import datetime, timezone
from typing import Optional, Tuple

from models.task import serialize_history, serialize_task
from repositories.task_history_repository import get_history_by_task_id, save_task_history
from repositories.task_repository import (
    create_task,
    get_all_tasks,
    get_task_by_id,
    get_task_document,
    soft_delete_task,
    update_task,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_task_owned(task_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    task = get_task_document(task_id, user_id)
    if not task:
        return None, "Task not found"
    return task, None


def create_new_task(task_data: dict) -> Tuple[Optional[str], Optional[str]]:
    task_id = create_task(task_data)
    return task_id, None


def fetch_all_tasks(user_id: str, include_inactive: bool = False) -> list:
    return get_all_tasks(user_id, include_inactive=include_inactive)


def fetch_task_by_id(task_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    task, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error
    return serialize_task(task), None


def update_existing_task(
    task_id: str,
    user_id: str,
    task_data: dict,
) -> Tuple[Optional[dict], Optional[str]]:
    current_task, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error

    if not current_task.get("is_active", True):
        return None, "Cannot update an inactive task"

    if not task_data:
        return None, "No fields provided for update"

    save_task_history(current_task)

    now = _utc_now()
    update_payload = {**task_data, "updated_at": now, "version": current_task.get("version", 1) + 1}

    updated_task = update_task(task_id, update_payload)
    return updated_task, None


def delete_existing_task(task_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    current_task, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error

    if not current_task.get("is_active", True):
        return None, "Task is already inactive"

    deleted_task = soft_delete_task(task_id)
    return deleted_task, None


def fetch_task_history(task_id: str, user_id: str) -> Tuple[Optional[list], Optional[str]]:
    _, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error

    history_records = get_history_by_task_id(task_id)
    return [serialize_history(record) for record in history_records], None
