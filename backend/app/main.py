from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# 現在のディレクトリを取得
current_dir = os.path.dirname(os.path.abspath(__file__))
# バックエンドディレクトリをパスに追加
backend_dir = os.path.dirname(current_dir) if "app" in current_dir else current_dir
sys.path.insert(0, backend_dir)

# モジュールのインポート
from app.models import Base  # app.modelsからBaseをインポート
from app.database import engine, SessionLocal
from app.api import todos, users

# データベーステーブルの作成
models.Base.metadata.create_all(bind=engine)

# FastAPI アプリの作成
app = FastAPI(title="Todo API")

# CORS 設定
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルートエンドポイント（ヘルスチェック用）
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Todo API is running"}

# ルーターの追加
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(todos.router, prefix="/api", tags=["todos"])

# 開発用：テストユーザーの作成
@app.on_event("startup")
async def startup_event():
    import auth
    
    db = SessionLocal()
    try:
        # テストユーザーの確認
        test_user = db.query(models.User).filter(models.User.username == "testuser").first()
        
        # 存在しない場合は作成
        if not test_user:
            hashed_password = auth.get_password_hash("password123")
            test_user = models.User(
                username="testuser",
                email="test@example.com",
                hashed_password=hashed_password
            )
            db.add(test_user)
            db.commit()
            print("Created test user: testuser")
    finally:
        db.close()