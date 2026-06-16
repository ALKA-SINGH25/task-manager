from pymongo import MongoClient
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DATABASE_NAME")]

def normalize_tasks():
    # 1. Drop task_history
    db.task_history.drop()
    
    # 2. Get all tasks
    tasks = list(db.tasks.find())
    
    fallback_user_id = "6a22705273096506d789d624"
    
    # Group by task_group_id (or _id if missing)
    groups = {}
    for task in tasks:
        tg_id = task.get("task_group_id")
        if not tg_id:
            tg_id = str(task["_id"])
        if tg_id not in groups:
            groups[tg_id] = []
        groups[tg_id].append(task)
        
    for tg_id, task_list in groups.items():
        # Sort tasks by version descending
        task_list.sort(key=lambda x: x.get("version", 1), reverse=True)
        
        # We need a user_id for the group. Find any task that has it.
        group_user_id = fallback_user_id
        for t in task_list:
            if t.get("user_id"):
                group_user_id = t["user_id"]
                break
        
        # The first one is the latest
        for i, task in enumerate(task_list):
            is_latest = (i == 0)
            update_fields = {
                "task_group_id": tg_id,
                "is_latest": is_latest,
                "user_id": task.get("user_id") or group_user_id
            }
            
            if "created_at" not in task or not task["created_at"]:
                update_fields["created_at"] = datetime.now(timezone.utc)
            if "updated_at" not in task or not task["updated_at"]:
                update_fields["updated_at"] = datetime.now(timezone.utc)
            if "version" not in task:
                update_fields["version"] = 1
                
            db.tasks.update_one(
                {"_id": task["_id"]},
                {
                    "$set": update_fields,
                    "$unset": {"is_active": ""}
                }
            )
            
    # Create indexes
    db.tasks.create_index([("task_group_id", 1)])
    db.tasks.create_index([("task_group_id", 1), ("is_latest", 1)])
    db.tasks.create_index([("task_group_id", 1), ("version", -1)])
    
    print(f"Normalized {len(tasks)} tasks across {len(groups)} groups.")
    print("task_history collection dropped.")
    print("is_active removed and is_latest set.")

if __name__ == "__main__":
    normalize_tasks()
