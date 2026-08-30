from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.database.models import SafetyReport

class SimilarityService:
    """
    Computes TF-IDF cosine similarity against historical reports stored in the database.
    Does not fabricate data; returns real historical matches or empty list.
    """

    def find_similar_reports(
        self,
        db: Session,
        query_text: str,
        top_k: int = 3,
        threshold: float = 0.15,
        exclude_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves stored reports from database, computes TF-IDF similarity,
        and returns the top matches above threshold.
        """
        # Fetch existing reports from DB
        query = db.query(SafetyReport)
        if exclude_id is not None:
            query = query.filter(SafetyReport.id != exclude_id)
        
        historical_reports = query.order_by(SafetyReport.id.desc()).limit(500).all()
        if not historical_reports:
            return []

        corpus = [r.report_text for r in historical_reports]
        all_texts = [query_text] + corpus

        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            
            # Query vector is at index 0, historical at 1:
            query_vec = tfidf_matrix[0:1]
            corpus_vecs = tfidf_matrix[1:]

            sim_scores = cosine_similarity(query_vec, corpus_vecs)[0]

            results = []
            for idx, score in enumerate(sim_scores):
                if score >= threshold:
                    report = historical_reports[idx]
                    results.append({
                        "id": report.id,
                        "similarity_percentage": round(float(score) * 100, 1),
                        "hazard": report.hazard_category,
                        "location": report.location,
                        "date": report.created_at.strftime("%Y-%m-%d") if report.created_at else None,
                        "risk_score": report.risk_score,
                    })

            # Sort descending by similarity
            results.sort(key=lambda x: x["similarity_percentage"], reverse=True)
            return results[:top_k]
        except Exception:
            return []

similarity_service = SimilarityService()
