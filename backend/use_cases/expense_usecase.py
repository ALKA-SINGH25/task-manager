from typing import Optional, Tuple
from repositories.expense_repository import (
    create_expense,
    get_filtered_expenses,
    get_expense_by_id,
    get_expense_document,
    soft_delete_expense,
    update_expense,
    get_expense_analytics
)
from models.expense import serialize_expense

def _ensure_expense_owned(expense_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    expense = get_expense_document(expense_id, user_id)
    if not expense:
        return None, "Expense not found"
    return expense, None

def create_new_expense(expense_data: dict) -> Tuple[Optional[str], Optional[str]]:
    expense_id = create_expense(expense_data)
    return expense_id, None

def fetch_all_expenses(
    user_id: str,
    search: Optional[str] = None,
    category: Optional[str] = None,
    month: Optional[str] = None,
    year: Optional[str] = None,
    sort_field: str = "expense_date",
    sort_order: str = "desc"
) -> list:
    return get_filtered_expenses(user_id, search, category, month, year, sort_field, sort_order)

def fetch_expense_by_id(expense_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    expense, error = _ensure_expense_owned(expense_id, user_id)
    if error:
        return None, error
    return serialize_expense(expense), None

def update_existing_expense(
    expense_id: str,
    user_id: str,
    expense_data: dict,
) -> Tuple[Optional[dict], Optional[str]]:
    current_expense, error = _ensure_expense_owned(expense_id, user_id)
    if error:
        return None, error

    if not expense_data:
        return None, "No fields provided for update"

    updated_expense = update_expense(expense_id, expense_data)
    return updated_expense, None

def delete_existing_expense(expense_id: str, user_id: str) -> Tuple[Optional[dict], Optional[str]]:
    current_expense, error = _ensure_expense_owned(expense_id, user_id)
    if error:
        return None, error

    deleted_expense = soft_delete_expense(expense_id)
    return deleted_expense, None

def fetch_expense_analytics(user_id: str) -> dict:
    return get_expense_analytics(user_id)
