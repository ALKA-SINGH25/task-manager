from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

from core.dependencies import get_current_user
from models.expense import ExpenseCreate, ExpenseUpdate
from repositories.expense_repository import get_expense_by_id
from use_cases.expense_usecase import (
    create_new_expense,
    delete_existing_expense,
    fetch_all_expenses,
    fetch_expense_by_id,
    update_existing_expense,
    fetch_expense_analytics
)

router = APIRouter()

@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create(expense: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    expense_data = expense.model_dump()
    expense_data["user_id"] = current_user["_id"]
    expense_id, error = create_new_expense(expense_data)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    created_expense = get_expense_by_id(expense_id)
    return {"id": expense_id, "message": "Expense created!", "expense": created_expense}

@router.get("/expenses/analytics")
def get_analytics(current_user: dict = Depends(get_current_user)):
    return fetch_expense_analytics(current_user["_id"])

@router.get("/expenses")
def get_expenses(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    year: Optional[str] = Query(None),
    sort_field: str = Query("expense_date"),
    sort_order: str = Query("desc"),
    current_user: dict = Depends(get_current_user)
):
    return fetch_all_expenses(
        user_id=current_user["_id"],
        search=search,
        category=category,
        month=month,
        year=year,
        sort_field=sort_field,
        sort_order=sort_order
    )

@router.get("/expenses/{expense_id}")
def get_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense, error = fetch_expense_by_id(expense_id, current_user["_id"])
    if error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
    return expense

@router.put("/expenses/{expense_id}")
def update(
    expense_id: str,
    expense: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
):
    expense_data = expense.model_dump(exclude_unset=True)
    updated_expense, error = update_existing_expense(expense_id, current_user["_id"], expense_data)
    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Expense not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)
    return updated_expense

@router.delete("/expenses/{expense_id}")
def delete(expense_id: str, current_user: dict = Depends(get_current_user)):
    deleted_expense, error = delete_existing_expense(expense_id, current_user["_id"])
    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Expense not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)
    return {"message": "Expense deleted!", "expense": deleted_expense}
