from datetime import datetime, timezone
from typing import Optional, Tuple

from models.task import serialize_task
from repositories.task_repository import (
    create_task,
    get_all_tasks,
    get_task_by_id,
    get_task_document,
    soft_delete_task,
    update_task,
    get_history_by_task_group_id,
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


def fetch_all_tasks(user_id: str) -> list:
    return get_all_tasks(user_id)


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

    if not task_data:
        return None, "No fields provided for update"

    updated_task = update_task(task_id, task_data)
    return updated_task, None


def delete_existing_task(task_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    current_task, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error

    deleted_task = soft_delete_task(task_id)
    return deleted_task, None


def fetch_task_history(task_id: str, user_id: str) -> Tuple[Optional[list], Optional[str]]:
    _, error = _ensure_task_owned(task_id, user_id)
    if error:
        return None, error

    history_records = get_history_by_task_group_id(task_id)
    return history_records, None
