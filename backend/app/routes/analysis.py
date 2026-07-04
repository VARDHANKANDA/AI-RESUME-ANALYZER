"""AI analysis and comparison routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth.jwt_handler import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models.analysis import AnalysisHistory, ResumeAnalysis
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.schemas.schemas import (
    AnalyzeRequest,
    AnalysisHistoryResponse,
    AnalysisResponse,
    CompareRequest,
    CoverLetterRequest,
    EmailReportRequest,
    InterviewQuestionsRequest,
    JobDescriptionCreate,
    JobDescriptionResponse,
    MessageResponse,
)
from app.services.ai_service import ai_service
from app.services.file_service import file_service
from app.services.job_parser import JobDescriptionParser
from app.services.report_service import ReportService
from app.services.resume_parser import ResumeParserService

router = APIRouter(tags=["Analysis"])
settings = get_settings()


def _get_user_resume(resume_id: int, user_id: int, db: Session) -> Resume:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


def _save_analysis(
    db: Session,
    user: User,
    resume: Resume,
    analysis_type: str,
    result: dict,
    tokens: int,
    job_id: Optional[int] = None,
) -> ResumeAnalysis:
    analysis = ResumeAnalysis(
        user_id=user.id,
        resume_id=resume.id,
        job_description_id=job_id,
        analysis_type=analysis_type,
        ats_score=result.get("ats_score", 0),
        match_percentage=result.get("match_percentage"),
        summary=result.get("summary"),
        strengths=result.get("strengths"),
        weaknesses=result.get("weaknesses"),
        missing_skills=result.get("missing_skills"),
        missing_keywords=result.get("missing_keywords"),
        matching_skills=result.get("matching_skills"),
        matching_keywords=result.get("matching_keywords"),
        skill_gap_analysis=result.get("skill_gap_analysis"),
        ats_breakdown=result.get("ats_breakdown"),
        grammar_suggestions=result.get("grammar_suggestions"),
        formatting_suggestions=result.get("formatting_suggestions"),
        readability_feedback=result.get("readability_feedback"),
        career_suggestions=result.get("career_suggestions"),
        ai_suggestions=result.get("ai_suggestions"),
        optimized_sections=result.get("optimized_sections"),
        ai_provider=settings.AI_PROVIDER,
        tokens_used=tokens,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    db.add(AnalysisHistory(
        user_id=user.id,
        analysis_id=analysis.id,
        event_type=analysis_type,
        event_data={"ats_score": analysis.ats_score, "match_percentage": analysis.match_percentage},
    ))
    db.commit()
    return analysis


@router.post("/job-description", response_model=JobDescriptionResponse, status_code=201)
async def create_job_description(
    data: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create job description from pasted text."""
    parsed = JobDescriptionParser.parse(data.raw_text)
    job = JobDescription(
        user_id=current_user.id,
        title=data.title,
        raw_text=data.raw_text,
        parsed_data=parsed,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return JobDescriptionResponse.model_validate(job)


@router.post("/job-description/upload", response_model=JobDescriptionResponse, status_code=201)
async def upload_job_description(
    file: UploadFile = File(...),
    title: str = "Untitled Job",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload job description file."""
    file_meta = await file_service.save_upload(file, subfolder=f"jobs/{current_user.id}")
    try:
        raw_text = ResumeParserService.extract_text(file_meta["file_path"], file_meta["file_type"])
    except Exception:
        with open(file_meta["file_path"], "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()

    parsed = JobDescriptionParser.parse(raw_text)
    job = JobDescription(
        user_id=current_user.id,
        title=title,
        raw_text=raw_text,
        filename=file_meta["original_filename"],
        parsed_data=parsed,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return JobDescriptionResponse.model_validate(job)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run AI-powered ATS analysis on a resume."""
    resume = _get_user_resume(request.resume_id, current_user.id, db)
    result, tokens = await ai_service.analyze_resume(
        resume.raw_text or "",
        resume.parsed_data or {},
    )
    analysis = _save_analysis(db, current_user, resume, "analyze", result, tokens)
    return AnalysisResponse.model_validate(analysis)


@router.post("/compare", response_model=AnalysisResponse)
async def compare_resume(
    request: CompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compare resume against a job description."""
    resume = _get_user_resume(request.resume_id, current_user.id, db)

    job_id = request.job_description_id
    job_text = request.job_text or ""
    job_parsed = {}

    if job_id:
        job = db.query(JobDescription).filter(
            JobDescription.id == job_id,
            JobDescription.user_id == current_user.id,
        ).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job description not found")
        job_text = job.raw_text
        job_parsed = job.parsed_data or {}
    elif not job_text:
        raise HTTPException(status_code=400, detail="Provide job_description_id or job_text")

    if not job_id:
        parsed = JobDescriptionParser.parse(job_text)
        job = JobDescription(
            user_id=current_user.id,
            title=request.job_title,
            raw_text=job_text,
            parsed_data=parsed,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id
        job_parsed = parsed

    result, tokens = await ai_service.compare_resume_job(
        resume.raw_text or "",
        resume.parsed_data or {},
        job_text,
        job_parsed,
    )
    analysis = _save_analysis(db, current_user, resume, "compare", result, tokens, job_id)
    return AnalysisResponse.model_validate(analysis)


@router.get("/history", response_model=AnalysisHistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    analysis_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get analysis history with pagination and filtering."""
    query = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == current_user.id)
    if analysis_type:
        query = query.filter(ResumeAnalysis.analysis_type == analysis_type)

    query = query.order_by(ResumeAnalysis.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return AnalysisHistoryResponse(
        items=[AnalysisResponse.model_validate(a) for a in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific analysis result."""
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == analysis_id,
        ResumeAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResponse.model_validate(analysis)


@router.get("/analysis/{analysis_id}/download")
def download_report(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download analysis report as PDF."""
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == analysis_id,
        ResumeAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    data = AnalysisResponse.model_validate(analysis).model_dump()
    pdf_bytes = ReportService.generate_analysis_pdf(data, resume.original_filename if resume else "Resume")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=analysis_{analysis_id}.pdf"},
    )


@router.post("/cover-letter", response_model=MessageResponse)
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate AI cover letter."""
    resume = _get_user_resume(request.resume_id, current_user.id, db)
    job_text = request.job_text or ""
    if request.job_description_id:
        job = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
        if job:
            job_text = job.raw_text

    letter, _ = await ai_service.generate_cover_letter(
        resume.parsed_data or {}, job_text, request.tone
    )
    return MessageResponse(message="Cover letter generated", data={"cover_letter": letter})


@router.post("/interview-questions", response_model=MessageResponse)
async def generate_interview_questions(
    request: InterviewQuestionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate interview questions based on resume and job."""
    resume = _get_user_resume(request.resume_id, current_user.id, db)
    job_text = request.job_text or ""
    if request.job_description_id:
        job = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
        if job:
            job_text = job.raw_text

    questions, _ = await ai_service.generate_interview_questions(
        resume.parsed_data or {}, job_text, request.count
    )
    return MessageResponse(message="Interview questions generated", data={"questions": questions})


@router.post("/email-report", response_model=MessageResponse)
def email_report(
    request: EmailReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Queue analysis report email (simulated in demo)."""
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == request.analysis_id,
        ResumeAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # In production, integrate with SendGrid/SES
    return MessageResponse(
        message=f"Report queued for delivery to {request.recipient_email}",
        data={"analysis_id": analysis.id, "status": "queued"},
    )
