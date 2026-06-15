from fastapi import APIRouter, Depends, HTTPException, Query, status

from core.dependencies import get_current_user
from models.task import TaskCreate, TaskUpdate
from repositories.task_repository import get_task_by_id
from use_cases.task_use_case import (
    create_new_task,
    delete_existing_task,
    fetch_all_tasks,
    fetch_task_by_id,
    fetch_task_history,
    update_existing_task,
)

router = APIRouter()


@router.post("/tasks", status_code=status.HTTP_201_CREATED)
def create(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_data = task.model_dump()
    task_data["user_id"] = current_user["_id"]
    task_id, error = create_new_task(task_data)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    created_task = get_task_by_id(task_id)
    return {"id": task_id, "message": "Task created!", "task": created_task}


@router.get("/tasks")
def get_tasks(
    include_inactive: bool = Query(default=False),
    current_user: dict = Depends(get_current_user),
):
    return fetch_all_tasks(current_user["_id"], include_inactive=include_inactive)


@router.get("/tasks/{task_id}")
def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task, error = fetch_task_by_id(task_id, current_user["_id"])
    if error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
    return task


@router.put("/tasks/{task_id}")
def update(
    task_id: str,
    task: TaskUpdate,
    current_user: dict = Depends(get_current_user),
):
    task_data = task.model_dump(exclude_unset=True)
    updated_task, error = update_existing_task(task_id, current_user["_id"], task_data)
    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Task not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)
    return updated_task


@router.delete("/tasks/{task_id}")
def delete(task_id: str, current_user: dict = Depends(get_current_user)):
    deleted_task, error = delete_existing_task(task_id, current_user["_id"])
    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Task not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)
    return {"message": "Task deleted!", "task": deleted_task}


@router.get("/tasks/{task_id}/history")
def get_task_history(task_id: str, current_user: dict = Depends(get_current_user)):
    history, error = fetch_task_history(task_id, current_user["_id"])
    if error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
    return history
