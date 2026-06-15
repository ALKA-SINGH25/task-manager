from repositories.user_repository import create_user, get_user_by_email
from core.security import hash_password, verify_password, create_access_token

def register_user(user_data: dict):
    existing = get_user_by_email(user_data["email"])
    if existing:
        return None, "Email already registered"
    
    user_data["password"] = hash_password(user_data["password"])
    user_id = create_user(user_data)
    
    token = create_access_token({"sub": user_id})
    return token, None

def login_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None, "User not found"
    
    if not verify_password(password, user["password"]):
        return None, "Invalid password"
    
    token = create_access_token({"sub": user["_id"]})
    return token, None