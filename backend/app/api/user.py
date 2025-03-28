from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user, get_password_hash
from pydantic import BaseModel, EmailStr

router = APIRouter()

# リクエストボディのバリデーション用モデル
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

@router.post("/users", response_model=dict)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # ユーザー名の重複チェック
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # メールアドレスの重複チェック
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 新しいユーザーの作成
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database error")
    
    return {
        "username": db_user.username,
        "email": db_user.email,
        "is_active": db_user.is_active
    }

# 既存のエンドポイント
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.get("/users/me", response_model=dict)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active
    }