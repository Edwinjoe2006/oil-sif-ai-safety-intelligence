from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.schemas import SimilarReportItem
from app.services.similarity_service import similarity_service

router = APIRouter(prefix="/similar-reports", tags=["Similarity"])

@router.get("", response_model=List[SimilarReportItem])
def search_similar_reports(
    query: str = Query(..., min_length=3, description="Search text to find historically similar reports"),
    limit: int = Query(3, ge=1, le=10, description="Max similar reports to return"),
    db: Session = Depends(get_db)
):
    """
    Finds historical reports with high textual similarity using TF-IDF cosine similarity.
    """
    matches = similarity_service.find_similar_reports(db, query, top_k=limit)
    return [SimilarReportItem(**m) for m in matches]
