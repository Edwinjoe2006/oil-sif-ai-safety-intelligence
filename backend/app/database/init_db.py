from app.database.database import engine, Base
from app.database.models import SafetyReport, Feedback, CorrectiveAction, AnalysisHistory
import logging

logger = logging.getLogger(__name__)

def init_db():
    """Initializes all database tables safely without dropping existing tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e

if __name__ == "__main__":
    init_db()
