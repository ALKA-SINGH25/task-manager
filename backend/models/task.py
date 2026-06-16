from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, field_validator

VALID_STATUSES = {"todo", "in-progress", "done"}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_datetime(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    end_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return value

    @field_validator("end_date")
    @classmethod
    def end_date_not_in_past(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value is None:
            return None
        normalized = _normalize_datetime(value)
        today = _utc_now().replace(hour=0, minute=0, second=0, microsecond=0)
        if normalized < today:
            raise ValueError("End date cannot be before the current date")
        return normalized


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip() if value is not None else None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return value

    @field_validator("end_date")
    @classmethod
    def normalize_end_date(cls, value: Optional[datetime]) -> Optional[datetime]:
        return _normalize_datetime(value)


class TaskResponse(BaseModel):
    id: str
    _id: str
    title: str
    description: Optional[str] = None
    status: str
    user_id: str
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    version: int = 1
    is_latest: bool = True
    task_version_id: Optional[str] = None


def serialize_datetime(value: Optional[datetime]) -> Optional[str]:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def serialize_task(task: dict) -> dict:
    task_group_id = task.get("task_group_id", str(task["_id"]))
    return {
        "id": task_group_id,
        "_id": task_group_id,
        "task_version_id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "status": task["status"],
        "user_id": task.get("user_id"),
        "end_date": serialize_datetime(task.get("end_date")),
        "created_at": serialize_datetime(task.get("created_at")),
        "updated_at": serialize_datetime(task.get("updated_at")),
        "version": task.get("version", 1),
        "is_latest": task.get("is_latest", True),
    }
