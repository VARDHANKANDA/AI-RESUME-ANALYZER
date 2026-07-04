"""Resume upload and management routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.jwt_handler import get_current_user
from app.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.schemas import MessageResponse, ResumeListResponse, ResumeResponse
from app.services.file_service import file_service
from app.services.resume_parser import ResumeParserService

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload-resume", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload and parse a resume (PDF or DOCX)."""
    file_meta = await file_service.save_upload(file, subfolder=f"resumes/{current_user.id}")

    try:
        raw_text = ResumeParserService.extract_text(file_meta["file_path"], file_meta["file_type"])
        parsed = ResumeParserService.parse_resume(raw_text)
        parsed_data = parsed.model_dump()
    except Exception as exc:
        file_service.delete_file(file_meta["file_path"])
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {exc}") from exc

    resume = Resume(
        user_id=current_user.id,
        filename=file_meta["filename"],
        original_filename=file_meta["original_filename"],
        file_path=file_meta["file_path"],
        file_type=file_meta["file_type"],
        file_size=file_meta["file_size"],
        raw_text=raw_text,
        parsed_data=parsed_data,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return ResumeResponse.model_validate(resume)


@router.get("/list", response_model=ResumeListResponse)
def list_resumes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List user resumes with pagination, search, and sorting."""
    query = db.query(Resume).filter(Resume.user_id == current_user.id)

    if search:
        query = query.filter(Resume.original_filename.ilike(f"%{search}%"))

    sort_column = getattr(Resume, sort_by, Resume.created_at)
    query = query.order_by(sort_column.desc() if sort_order == "desc" else sort_column.asc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return ResumeListResponse(
        items=[ResumeResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific resume by ID."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse.model_validate(resume)


@router.delete("/{resume_id}", response_model=MessageResponse)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a resume and its associated file."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_service.delete_file(resume.file_path)
    db.delete(resume)
    db.commit()
    return MessageResponse(message="Resume deleted successfully")
