from datetime import datetime, timedelta
import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from dotenv import load_dotenv
import logging

# .envファイルから環境変数を読み込む
load_dotenv()

# 環境変数から設定を取得
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# パスワードハッシュのコンテキスト
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2認証用のエンドポイント
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/token")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# パスワードの検証
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# パスワードのハッシュ化
def get_password_hash(password):
    return pwd_context.hash(password)

# 現在のユーザーを取得する依存関係
async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    # Remove authentication logic
    logger.info("Access granted without authentication")
    return None

# アクティブなユーザーを取得する依存関係
async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
):
    # Remove active user check
    logger.info("Access granted without active user check")
    return None