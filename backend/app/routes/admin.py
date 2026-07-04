"""Admin panel routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.jwt_handler import get_current_admin
from app.database import get_db
from app.models.analysis import ResumeAnalysis
from app.models.resume import Resume
from app.models.user import User
from app.schemas.schemas import AdminAnalytics, AdminUserResponse, AnalysisResponse, MessageResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all users with stats."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for user in users:
        resume_count = db.query(Resume).filter(Resume.user_id == user.id).count()
        analysis_count = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id).count()
        result.append(AdminUserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_admin=user.is_admin,
            is_active=user.is_active,
            resume_count=resume_count,
            analysis_count=analysis_count,
            created_at=user.created_at,
        ))
    return result


@router.delete("/user/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a user account."""
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return MessageResponse(message=f"User {user.email} deleted successfully")


@router.get("/resumes")
def list_all_resumes(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """View all uploaded resumes."""
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).limit(100).all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "filename": r.original_filename,
            "file_type": r.file_type,
            "created_at": r.created_at,
        }
        for r in resumes
    ]


@router.get("/analytics", response_model=AdminAnalytics)
def get_admin_analytics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get platform-wide analytics and AI usage stats."""
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_analyses = db.query(ResumeAnalysis).count()
    active_users = db.query(User).filter(User.is_active == True).count()  # noqa: E712

    token_stats = db.query(
        func.sum(ResumeAnalysis.tokens_used),
        func.count(ResumeAnalysis.id),
    ).first()

    ai_usage = {
        "total_analyses": total_analyses,
        "total_tokens_used": token_stats[0] or 0,
        "analyses_with_tokens": token_stats[1] or 0,
    }

    recent = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(10)
        .all()
    )

    return AdminAnalytics(
        total_users=total_users,
        total_resumes=total_resumes,
        total_analyses=total_analyses,
        active_users=active_users,
        ai_usage=ai_usage,
        recent_analyses=[AnalysisResponse.model_validate(a) for a in recent],
    )


@router.get("/analysis-logs")
def get_analysis_logs(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """View analysis logs."""
    analyses = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "resume_id": a.resume_id,
            "type": a.analysis_type,
            "ats_score": a.ats_score,
            "ai_provider": a.ai_provider,
            "tokens_used": a.tokens_used,
            "created_at": a.created_at,
        }
        for a in analyses
    ]
