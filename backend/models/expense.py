from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, field_validator

VALID_CATEGORIES = {
    "Education Loan",
    "EMI",
    "Household",
    "Grocery",
    "Shopping",
    "Food",
    "Transport",
    "Bills",
    "Medical",
    "Entertainment",
    "Miscellaneous"
}

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _normalize_datetime(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: Optional[str] = None
    expense_date: datetime

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Amount must be greater than 0")
        return value

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return value

    @field_validator("expense_date")
    @classmethod
    def normalize_expense_date(cls, value: datetime) -> datetime:
        return _normalize_datetime(value)

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    expense_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip() if value is not None else None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value <= 0:
            raise ValueError("Amount must be greater than 0")
        return value

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return value

    @field_validator("expense_date")
    @classmethod
    def normalize_expense_date(cls, value: Optional[datetime]) -> Optional[datetime]:
        return _normalize_datetime(value)

def serialize_datetime(value: Optional[datetime]) -> Optional[str]:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()

def serialize_expense(expense: dict) -> dict:
    return {
        "id": str(expense["_id"]),
        "_id": str(expense["_id"]),
        "user_id": expense.get("user_id"),
        "title": expense["title"],
        "amount": expense["amount"],
        "category": expense["category"],
        "description": expense.get("description"),
        "expense_date": serialize_datetime(expense.get("expense_date")),
        "created_at": serialize_datetime(expense.get("created_at")),
        "updated_at": serialize_datetime(expense.get("updated_at")),
        "is_active": expense.get("is_active", True)
    }
