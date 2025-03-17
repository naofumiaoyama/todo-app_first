from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, auth
from app.database import get_db

router = APIRouter()

@router.get("/todos", response_model=List[schemas.Todo])
def read_todos(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    todos = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id).offset(skip).limit(limit).all()
    return todos

@router.post("/todos", response_model=schemas.Todo, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo: schemas.TodoCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_todo = models.Todo(**todo.dict(), owner_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.get("/todos/{todo_id}", response_model=schemas.Todo)
def read_todo(
    todo_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, 
        models.Todo.owner_id == current_user.id
    ).first()
    
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(
    todo_id: int, 
    todo: schemas.TodoUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, 
        models.Todo.owner_id == current_user.id
    ).first()
    
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    # Update todo attributes
    update_data = todo.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)
        
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id, 
        models.Todo.owner_id == current_user.id
    ).first()
    
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    db.delete(db_todo)
    db.commit()
    return None