import logging
from sqlalchemy import inspect, text
from app.database.database import engine, Base
from app.database.models import SafetyReport, Feedback, CorrectiveAction, SafetyAlert, AIDecisionAudit, Asset, AnalysisHistory

logger = logging.getLogger("OIL-SIF-AI.init_db")

def _migrate_tables(db_engine):
    """Safely adds missing columns to existing tables without dropping data."""
    try:
        inspector = inspect(db_engine)
        tables = inspector.get_table_names()

        # Migrate safety_reports
        if "safety_reports" in tables:
            existing_cols = {c["name"] for c in inspector.get_columns("safety_reports")}
            with db_engine.begin() as conn:
                if "asset" not in existing_cols:
                    conn.execute(text("ALTER TABLE safety_reports ADD COLUMN asset VARCHAR(150)"))
                if "image_url" not in existing_cols:
                    conn.execute(text("ALTER TABLE safety_reports ADD COLUMN image_url VARCHAR(500)"))
                if "bow_tie" not in existing_cols:
                    conn.execute(text("ALTER TABLE safety_reports ADD COLUMN bow_tie JSON"))
                if "copilot" not in existing_cols:
                    conn.execute(text("ALTER TABLE safety_reports ADD COLUMN copilot JSON"))

        # Migrate feedback
        if "feedback" in tables:
            existing_cols = {c["name"] for c in inspector.get_columns("feedback")}
            with db_engine.begin() as conn:
                if "actual_sif" not in existing_cols:
                    conn.execute(text("ALTER TABLE feedback ADD COLUMN actual_sif BOOLEAN"))
                if "reviewer_name" not in existing_cols:
                    conn.execute(text("ALTER TABLE feedback ADD COLUMN reviewer_name VARCHAR(100)"))
                if "reviewer_reason" not in existing_cols:
                    conn.execute(text("ALTER TABLE feedback ADD COLUMN reviewer_reason VARCHAR(255)"))

        # Migrate corrective_actions
        if "corrective_actions" in tables:
            existing_cols = {c["name"] for c in inspector.get_columns("corrective_actions")}
            with db_engine.begin() as conn:
                if "priority" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN priority VARCHAR(50) DEFAULT 'HIGH'"))
                if "responsible_person" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN responsible_person VARCHAR(100)"))
                if "department" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN department VARCHAR(100) DEFAULT 'HSE'"))
                if "due_date" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN due_date DATETIME"))
                if "status" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN status VARCHAR(50) DEFAULT 'OPEN'"))
                if "evidence" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN evidence TEXT"))
                if "verification_notes" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN verification_notes TEXT"))
                if "created_at" not in existing_cols:
                    conn.execute(text("ALTER TABLE corrective_actions ADD COLUMN created_at DATETIME"))

    except Exception as e:
        logger.warning(f"Migration check noticed: {e}")

def _seed_default_assets(db_engine):
    """Seeds baseline assets if none exist."""
    from sqlalchemy.orm import Session
    with Session(db_engine) as session:
        try:
            count = session.query(Asset).count()
            if count == 0:
                logger.info("Seeding initial asset risk intelligence records...")
                default_assets = [
                    Asset(
                        name="Flare Header 04",
                        asset_type="Flare & Relief System",
                        location="Offshore Platform Alpha - Deck 3",
                        criticality="CRITICAL",
                        risk_score=82,
                        degradation_level="High",
                        failure_probability=0.28,
                        precursor_count=7,
                        maintenance_status="Inspection Required"
                    ),
                    Asset(
                        name="Mud Pump #2",
                        asset_type="High Pressure Drilling Pump",
                        location="Drilling Rig Beta - Mud Pit",
                        criticality="HIGH",
                        risk_score=71,
                        degradation_level="Moderate",
                        failure_probability=0.19,
                        precursor_count=4,
                        maintenance_status="Operational"
                    ),
                    Asset(
                        name="High Pressure Separator A",
                        asset_type="Pressure Vessel",
                        location="Gas Processing Unit 1",
                        criticality="CRITICAL",
                        risk_score=78,
                        degradation_level="High",
                        failure_probability=0.24,
                        precursor_count=5,
                        maintenance_status="Maintenance Due"
                    ),
                    Asset(
                        name="Offshore Crane 1",
                        asset_type="Lifting Equipment",
                        location="Main Deck - Starboard",
                        criticality="HIGH",
                        risk_score=64,
                        degradation_level="Moderate",
                        failure_probability=0.14,
                        precursor_count=3,
                        maintenance_status="Operational"
                    ),
                    Asset(
                        name="Wellhead B-12",
                        asset_type="Subsea / Surface Wellhead",
                        location="Wellbay Area 2",
                        criticality="CRITICAL",
                        risk_score=85,
                        degradation_level="Severe",
                        failure_probability=0.32,
                        precursor_count=8,
                        maintenance_status="Maintenance Due"
                    ),
                    Asset(
                        name="Gas Compressor 01",
                        asset_type="Rotating Equipment",
                        location="Compressor Hall 3",
                        criticality="HIGH",
                        risk_score=59,
                        degradation_level="Moderate",
                        failure_probability=0.12,
                        precursor_count=2,
                        maintenance_status="Operational"
                    ),
                ]
                session.add_all(default_assets)
                session.commit()
                logger.info("Default assets seeded successfully.")
        except Exception as e:
            logger.warning(f"Could not seed default assets: {e}")

def init_db():
    """Initializes all database tables safely without dropping existing tables."""
    try:
        Base.metadata.create_all(bind=engine)
        _migrate_tables(engine)
        _seed_default_assets(engine)
        logger.info("Database tables initialized and migrated successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e

if __name__ == "__main__":
    init_db()

