from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt

# モデルのインポート
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.model import Base, User, Todo
from app.database import SQLALCHEMY_DATABASE_URL

def create_sample_data():
    # データベースエンジンの作成
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # テーブルの作成
    Base.metadata.create_all(bind=engine)
    
    # セッションの作成
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 既存のユーザーを確認
        existing_user = db.query(User).filter(User.username == "testuser").first()
        
        if not existing_user:
            # サンプルユーザーの作成
            sample_user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=bcrypt.hash("password123"),
                is_active=True
            )
            db.add(sample_user)
            db.commit()
            db.refresh(sample_user)
            user_id = sample_user.id
        else:
            user_id = existing_user.id
            print("既存のユーザーを使用します。")

        # サンプルTodoの作成
        todos = [
            Todo(
                title="買い物に行く",
                description="牛乳、パン、卵を買う",
                completed=False,
                priority=3,
                owner_id=user_id
            ),
            Todo(
                title="プロジェクトの締め切り",
                description="レポートを完成させる",
                completed=False,
                priority=3,
                owner_id=user_id
            ),
            Todo(
                title="運動する",
                description="30分ジョギング",
                completed=True,
                priority=2,
                owner_id=user_id
            ),
            Todo(
                title="本を読む",
                description="新しい技術書を読む",
                completed=False,
                priority=1,
                owner_id=user_id
            )
        ]

        for todo in todos:
            db.add(todo)
        
        db.commit()
        print("サンプルデータが正常に追加されました。")

    except Exception as e:
        print(f"エラーが発生しました: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()