from datetime import datetime, timezone

from database import db

collection = db["task_history"]


def save_task_history(task: dict) -> str:
    history_record = {
        "task_id": task["_id"],
        "version": task.get("version", 1),
        "title": task["title"],
        "description": task.get("description"),
        "status": task["status"],
        "end_date": task.get("end_date"),
        "created_at": task.get("created_at"),
        "updated_at": task.get("updated_at"),
        "history_created_at": datetime.now(timezone.utc),
    }
    result = collection.insert_one(history_record)
    return str(result.inserted_id)


def get_history_by_task_id(task_id: str) -> list:
    records = []
    for record in collection.find({"task_id": task_id}).sort("version", -1):
        record["_id"] = str(record["_id"])
        records.append(record)
    return records
