"""Dashboard analytics routes."""

from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.jwt_handler import get_current_user
from app.database import get_db
from app.models.analysis import ResumeAnalysis
from app.models.resume import Resume
from app.models.user import User
from app.schemas.schemas import AnalysisResponse, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics and chart data."""
    total_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    analyses = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )
    total_analyses = len(analyses)

    scores = [a.ats_score for a in analyses if a.ats_score]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    best_score = max(scores) if scores else 0.0

    recent = [AnalysisResponse.model_validate(a) for a in analyses[:5]]

    # ATS score trend (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    trend_analyses = [a for a in analyses if a.created_at >= thirty_days_ago]
    ats_trend = [
        {"date": a.created_at.strftime("%Y-%m-%d"), "score": a.ats_score, "type": a.analysis_type}
        for a in reversed(trend_analyses)
    ]

    # Skill distribution from parsed resumes
    skill_counter: Counter = Counter()
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    for resume in resumes:
        skills = (resume.parsed_data or {}).get("skills", [])
        skill_counter.update(skills)

    skill_distribution = [
        {"skill": skill, "count": count}
        for skill, count in skill_counter.most_common(15)
    ]

    # Improvement history
    improvement_history = [
        {
            "date": a.created_at.strftime("%Y-%m-%d"),
            "ats_score": a.ats_score,
            "analysis_id": a.id,
        }
        for a in analyses[:20]
    ]

    # Match history
    match_history = [
        {
            "date": a.created_at.strftime("%Y-%m-%d"),
            "match_percentage": a.match_percentage or 0,
            "analysis_id": a.id,
        }
        for a in analyses if a.analysis_type == "compare"
    ][:20]

    # Skill radar from latest analysis breakdown
    skill_radar = []
    if analyses:
        latest = analyses[0]
        breakdown = latest.ats_breakdown or {}
        skill_radar = [
            {"category": k.replace("_", " ").title(), "score": v}
            for k, v in breakdown.items()
        ]

    return DashboardStats(
        total_resumes=total_resumes,
        total_analyses=total_analyses,
        average_ats_score=avg_score,
        best_ats_score=best_score,
        recent_analyses=recent,
        ats_score_trend=ats_trend,
        skill_distribution=skill_distribution,
        improvement_history=improvement_history,
        match_history=match_history,
        skill_radar=skill_radar,
    )
