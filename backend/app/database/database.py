import os
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.utils.config import settings

logger = logging.getLogger("OIL-SIF-AI.database")

database_url = settings.DATABASE_URL

def _create_sqlite_engine(url_or_path: str = None):
    """Helper to safely create a SQLite engine with directory creation."""
    if url_or_path and url_or_path.startswith("sqlite"):
        db_path_str = url_or_path.replace("sqlite:///", "")
    else:
        db_path_str = str(settings.BACKEND_DIR / "data" / "oil_sif_safety.db")
    
    db_path = Path(db_path_str)
    if not db_path.is_absolute():
        db_path = (settings.BACKEND_DIR / db_path_str).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    sqlite_url = f"sqlite:///{db_path}"
    logger.info(f"Connecting to SQLite database at {sqlite_url}")
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

if database_url.startswith("mysql"):
    try:
        # Standardize mysql:// to mysql+pymysql:// if needed
        if database_url.startswith("mysql://"):
            database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 5}
        )
        # Test connection immediately
        with engine.connect() as conn:
            logger.info("Successfully connected to MySQL database.")
    except Exception as e:
        logger.warning(
            f"Failed to connect to MySQL database ({e}). Falling back to persistent SQLite storage."
        )
        engine = _create_sqlite_engine()
elif database_url.startswith("sqlite"):
    engine = _create_sqlite_engine(database_url)
else:
    # PostgreSQL or generic DB
    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
        with engine.connect() as conn:
            logger.info("Successfully connected to database.")
    except Exception as e:
        logger.warning(f"Failed to connect to configured DB ({e}). Falling back to SQLite.")
        engine = _create_sqlite_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that yields a database session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

