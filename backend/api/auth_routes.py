from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserRegister, UserLogin
from use_cases.auth_use_case import register_user, login_user
from core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: UserRegister):
    token, error = register_user(user.model_dump())
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(user: UserLogin):
    token, error = login_user(user.email, user.password)
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"]
    }