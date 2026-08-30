import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.utils.config import settings

database_url = settings.DATABASE_URL

# If using SQLite, ensure the target directory exists and configure connect_args
if database_url.startswith("sqlite"):
    # Extract file path from sqlite:///path
    db_path_str = database_url.replace("sqlite:///", "")
    db_path = Path(db_path_str)
    if not db_path.is_absolute():
        db_path = (settings.MODEL_DIR.parent / db_path_str).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that yields a database session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
