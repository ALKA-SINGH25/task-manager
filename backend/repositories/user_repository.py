from database import db

collection = db["users"]

def create_user(user_data: dict):
    result = collection.insert_one(user_data)
    return str(result.inserted_id)

def get_user_by_email(email: str):
    user = collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

def get_user_by_id(user_id: str):
    from bson import ObjectId
    user = collection.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = str(user["_id"])
    return user