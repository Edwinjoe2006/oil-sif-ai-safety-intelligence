import csv
import logging
from datetime import datetime
from pathlib import Path
from app.database.database import engine, Base, SessionLocal
from app.database.models import SafetyReport, Feedback, CorrectiveAction, AnalysisHistory
from app.services.explanation_service import explanation_service
from app.services.recommendation_service import recommendation_service
from app.utils.config import settings

logger = logging.getLogger(__name__)

def _seed_initial_data(db):
    """Populates baseline industrial safety reports if database has no records."""
    dataset_path = settings.DATASET_PATH
    if not dataset_path.exists():
        alt_paths = [
            settings.PROJECT_ROOT / "data" / "OIL_SIF_Synthetic_Dataset_5000.csv",
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "OIL_SIF_Synthetic_Dataset_5000.csv",
            Path("data/OIL_SIF_Synthetic_Dataset_5000.csv")
        ]
        for p in alt_paths:
            if p.exists():
                dataset_path = p
                break

    if dataset_path.exists():
        logger.info(f"Seeding database from dataset: {dataset_path}")
        try:
            with open(dataset_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    if count >= 60:
                        break

                    report_text = row.get("report_text", "").strip()
                    if not report_text:
                        continue

                    hazard = row.get("hazard_category", "General Safety")
                    sif_raw = str(row.get("sif_precursor", "No")).strip().lower()
                    sif_val = sif_raw in ["yes", "true", "1"]
                    severity = row.get("severity", "Medium")

                    try:
                        risk_score = int(float(row.get("risk_score", 45)))
                    except (ValueError, TypeError):
                        risk_score = 45

                    if risk_score >= 75:
                        risk_level = "CRITICAL"
                    elif risk_score >= 50:
                        risk_level = "HIGH"
                    elif risk_score >= 25:
                        risk_level = "MEDIUM"
                    else:
                        risk_level = "LOW"

                    factors = explanation_service.detect_factors(report_text)
                    consequences = explanation_service.get_consequences(hazard)
                    actions = recommendation_service.get_recommendations(hazard)
                    escalation = explanation_service.get_escalation_path(hazard)

                    created_at_str = row.get("report_date")
                    created_at = datetime.utcnow()
                    if created_at_str:
                        try:
                            created_at = datetime.strptime(created_at_str.strip(), "%Y-%m-%d")
                        except ValueError:
                            pass

                    report = SafetyReport(
                        report_text=report_text,
                        report_type=row.get("report_type", "Unsafe Condition"),
                        location=row.get("location", "Operational Asset"),
                        sif_prediction=sif_val,
                        sif_probability=0.88 if sif_val else 0.12,
                        hazard_category=hazard,
                        hazard_probability=0.92,
                        severity=severity,
                        severity_probability=0.89,
                        risk_score=risk_score,
                        risk_level=risk_level,
                        detected_factors=factors,
                        potential_consequences=consequences,
                        recommended_action=actions,
                        escalation_path=escalation,
                        status="Open" if count % 3 == 0 else ("In Progress" if count % 3 == 1 else "Resolved"),
                        created_at=created_at
                    )
                    db.add(report)
                    db.flush()

                    for act_text in actions[:2]:
                        action_row = CorrectiveAction(
                            report_id=report.id,
                            action_text=act_text,
                            is_completed=(count % 3 == 2),
                            assigned_to="Duty Safety Officer"
                        )
                        db.add(action_row)

                    count += 1

                db.commit()
                logger.info(f"Successfully seeded {count} baseline safety reports into SQLite.")
        except Exception as e:
            db.rollback()
            logger.error(f"Error seeding database from CSV: {e}")

def init_db():
    """Initializes all database tables safely and ensures baseline records exist."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")

        db = SessionLocal()
        try:
            count = db.query(SafetyReport).count()
            if count == 0:
                logger.info("Database is empty. Populating baseline records...")
                _seed_initial_data(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e

if __name__ == "__main__":
    init_db()
