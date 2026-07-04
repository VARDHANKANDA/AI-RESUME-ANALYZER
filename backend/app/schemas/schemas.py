"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_admin: bool
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None


# Resume schemas
class ParsedResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[str] = []
    languages: List[str] = []
    github: Optional[str] = None
    linkedin: Optional[str] = None
    summary: Optional[str] = None


class ResumeResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeListResponse(BaseModel):
    items: List[ResumeResponse]
    total: int
    page: int
    page_size: int


# Job description schemas
class JobDescriptionCreate(BaseModel):
    title: str = "Untitled Job"
    raw_text: str = Field(min_length=10)


class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    raw_text: str
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# Analysis schemas
class AnalyzeRequest(BaseModel):
    resume_id: int


class CompareRequest(BaseModel):
    resume_id: int
    job_description_id: Optional[int] = None
    job_text: Optional[str] = None
    job_title: str = "Untitled Job"


class ATSBreakdown(BaseModel):
    skills_match: float = 0
    experience: float = 0
    education: float = 0
    formatting: float = 0
    keywords: float = 0
    projects: float = 0
    certifications: float = 0
    grammar: float = 0


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_description_id: Optional[int] = None
    analysis_type: str
    ats_score: float
    match_percentage: Optional[float] = None
    summary: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    matching_skills: Optional[List[str]] = None
    matching_keywords: Optional[List[str]] = None
    skill_gap_analysis: Optional[Dict[str, Any]] = None
    ats_breakdown: Optional[Dict[str, float]] = None
    grammar_suggestions: Optional[List[str]] = None
    formatting_suggestions: Optional[List[str]] = None
    readability_feedback: Optional[List[str]] = None
    career_suggestions: Optional[List[str]] = None
    ai_suggestions: Optional[List[str]] = None
    optimized_sections: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisHistoryResponse(BaseModel):
    items: List[AnalysisResponse]
    total: int
    page: int
    page_size: int


# Dashboard schemas
class DashboardStats(BaseModel):
    total_resumes: int
    total_analyses: int
    average_ats_score: float
    best_ats_score: float
    recent_analyses: List[AnalysisResponse]
    ats_score_trend: List[Dict[str, Any]]
    skill_distribution: List[Dict[str, Any]]
    improvement_history: List[Dict[str, Any]]
    match_history: List[Dict[str, Any]]
    skill_radar: List[Dict[str, Any]]


# Admin schemas
class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_admin: bool
    is_active: bool
    resume_count: int = 0
    analysis_count: int = 0
    created_at: datetime


class AdminAnalytics(BaseModel):
    total_users: int
    total_resumes: int
    total_analyses: int
    active_users: int
    ai_usage: Dict[str, Any]
    recent_analyses: List[AnalysisResponse]


# Additional feature schemas
class CoverLetterRequest(BaseModel):
    resume_id: int
    job_description_id: Optional[int] = None
    job_text: Optional[str] = None
    tone: str = "professional"


class InterviewQuestionsRequest(BaseModel):
    resume_id: int
    job_description_id: Optional[int] = None
    job_text: Optional[str] = None
    count: int = Field(default=10, ge=5, le=20)


class EmailReportRequest(BaseModel):
    analysis_id: int
    recipient_email: EmailStr


class MessageResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None
