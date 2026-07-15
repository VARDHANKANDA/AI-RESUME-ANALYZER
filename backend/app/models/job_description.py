"""Job description model for storing and parsing job postings."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Job")
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parsed_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # required_skills, responsibilities, qualifications, experience, preferred_technologies

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="job_descriptions")
    analyses = relationship("ResumeAnalysis", back_populates="job_description")
