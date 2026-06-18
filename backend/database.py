from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DATABASE_NAME")]

logger = logging.getLogger(__name__)

def create_index_safe(collection, keys, name, unique=False):
    try:
        # Check existing indexes to drop conflicting ones
        existing = collection.index_information()
        for idx_name, idx_info in existing.items():
            if idx_name == "_id_":
                continue
            if idx_info.get("key") == keys:
                if idx_name != name:
                    logger.info(f"Dropping old index '{idx_name}' to recreate as '{name}'")
                    collection.drop_index(idx_name)
                else:
                    logger.info(f"Index '{name}' already exists.")
                    return
                    
        collection.create_index(keys, name=name, unique=unique)
        logger.info(f"Index '{name}' created successfully.")
    except Exception as e:
        logger.error(f"Failed to create index '{name}': {e}")

def initialize_indexes():
    logger.info("Creating MongoDB indexes...")
    
    # 1. Get all latest tasks for a user
    create_index_safe(
        db.tasks,
        [("user_id", 1), ("is_latest", 1)],
        "user_latest_idx"
    )

    # 2. Get latest version of a task
    create_index_safe(
        db.tasks,
        [("task_group_id", 1), ("is_latest", 1)],
        "task_group_latest_idx"
    )

    # 3. Get task history
    create_index_safe(
        db.tasks,
        [("task_group_id", 1), ("version", -1)],
        "task_history_idx"
    )

    # 4. Status filtering
    create_index_safe(
        db.tasks,
        [("status", 1)],
        "status_idx"
    )
    
    # 5. User email lookup (unique)
    create_index_safe(
        db.users,
        [("email", 1)],
        "user_email_idx",
        unique=True
    )

    logger.info("MongoDB indexes initialized successfully")