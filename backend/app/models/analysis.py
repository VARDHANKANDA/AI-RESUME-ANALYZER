"""Resume analysis and history models."""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    resume_id: Mapped[int] = mapped_column(ForeignKey("resumes.id", ondelete="CASCADE"), index=True)
    job_description_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True
    )
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False)  # analyze | compare

    ats_score: Mapped[float] = mapped_column(Float, default=0.0)
    match_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Full AI analysis results as JSON
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_keywords: Mapped[list | None] = mapped_column(JSON, nullable=True)
    matching_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    matching_keywords: Mapped[list | None] = mapped_column(JSON, nullable=True)
    skill_gap_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    ats_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    grammar_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    formatting_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    readability_feedback: Mapped[list | None] = mapped_column(JSON, nullable=True)
    career_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ai_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    optimized_sections: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    ai_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job_description = relationship("JobDescription", back_populates="analyses")
    history_entries = relationship(
        "AnalysisHistory", back_populates="analysis", cascade="all, delete-orphan"
    )


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("resume_analyses.id", ondelete="CASCADE"), index=True
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    event_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="history_entries")
