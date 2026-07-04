"""Resume text extraction and section parsing service."""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import pdfplumber
import fitz  # PyMuPDF
from docx import Document

from app.schemas.schemas import ParsedResumeData


SECTION_PATTERNS = {
    "skills": r"(?:skills|technical skills|core competencies|technologies)",
    "education": r"(?:education|academic|qualifications)",
    "experience": r"(?:experience|work experience|employment|professional experience)",
    "projects": r"(?:projects|personal projects|key projects)",
    "certifications": r"(?:certifications|certificates|licenses)",
    "languages": r"(?:languages|language proficiency)",
    "summary": r"(?:summary|profile|objective|about me)",
}


class ResumeParserService:
    """Extract text from PDF/DOCX files and parse resume sections."""

    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        path = Path(file_path)
        if file_type == "pdf":
            return ResumeParserService._extract_pdf(path)
        if file_type == "docx":
            return ResumeParserService._extract_docx(path)
        raise ValueError(f"Unsupported file type: {file_type}")

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        text_parts: List[str] = []
        # Try pdfplumber first for better text layout
        try:
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception:
            pass

        if not text_parts:
            doc = fitz.open(path)
            for page in doc:
                text_parts.append(page.get_text())
            doc.close()

        return "\n".join(text_parts).strip()

    @staticmethod
    def _extract_docx(path: Path) -> str:
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    @staticmethod
    def parse_resume(text: str) -> ParsedResumeData:
        """Parse resume text into structured sections using regex heuristics."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        email = ResumeParserService._extract_email(text)
        phone = ResumeParserService._extract_phone(text)
        github = ResumeParserService._extract_url(text, "github")
        linkedin = ResumeParserService._extract_url(text, "linkedin")
        name = ResumeParserService._extract_name(lines, email)
        address = ResumeParserService._extract_address(lines)

        sections = ResumeParserService._split_sections(text)
        skills = ResumeParserService._parse_list_section(sections.get("skills", ""))
        education = ResumeParserService._parse_education(sections.get("education", ""))
        experience = ResumeParserService._parse_experience(sections.get("experience", ""))
        projects = ResumeParserService._parse_projects(sections.get("projects", ""))
        certifications = ResumeParserService._parse_list_section(
            sections.get("certifications", "")
        )
        languages = ResumeParserService._parse_list_section(sections.get("languages", ""))
        summary = sections.get("summary", "").strip() or None

        # Fallback: extract skills from full text if section not found
        if not skills:
            skills = ResumeParserService._extract_inline_skills(text)

        return ParsedResumeData(
            name=name,
            email=email,
            phone=phone,
            address=address,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            languages=languages,
            github=github,
            linkedin=linkedin,
            summary=summary,
        )

    @staticmethod
    def _extract_email(text: str) -> Optional[str]:
        match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
        return match.group(0) if match else None

    @staticmethod
    def _extract_phone(text: str) -> Optional[str]:
        patterns = [
            r"\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}",
            r"\(\d{3}\)\s*\d{3}[-.\s]?\d{4}",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None

    @staticmethod
    def _extract_url(text: str, platform: str) -> Optional[str]:
        pattern = rf"https?://(?:www\.)?{platform}\.com/[\w\-./]+"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
        short = re.search(rf"{platform}\.com/[\w\-./]+", text, re.IGNORECASE)
        return short.group(0) if short else None

    @staticmethod
    def _extract_name(lines: List[str], email: Optional[str]) -> Optional[str]:
        for line in lines[:5]:
            if email and email in line:
                continue
            if re.search(r"@|http|linkedin|github|phone|\d{3}", line, re.I):
                continue
            if 2 <= len(line.split()) <= 5 and len(line) < 60:
                return line
        return lines[0] if lines else None

    @staticmethod
    def _extract_address(lines: List[str]) -> Optional[str]:
        for line in lines[:10]:
            if re.search(r"\b(?:street|st\.|avenue|ave\.|city|state|zip|\d{5})\b", line, re.I):
                return line
        return None

    @staticmethod
    def _split_sections(text: str) -> Dict[str, str]:
        lines = text.split("\n")
        sections: Dict[str, str] = {}
        current_key = "header"
        current_lines: List[str] = []

        for line in lines:
            stripped = line.strip()
            matched_key = None
            for key, pattern in SECTION_PATTERNS.items():
                if re.match(rf"^{pattern}\s*:?\s*$", stripped, re.IGNORECASE):
                    if current_key != "header":
                        sections[current_key] = "\n".join(current_lines)
                    current_key = key
                    current_lines = []
                    matched_key = key
                    break

            if matched_key is None:
                current_lines.append(line)

        if current_key != "header":
            sections[current_key] = "\n".join(current_lines)

        return sections

    @staticmethod
    def _parse_list_section(text: str) -> List[str]:
        if not text:
            return []
        items = re.split(r"[,|•\n\-·]", text)
        return [item.strip() for item in items if item.strip() and len(item.strip()) > 1][:30]

    @staticmethod
    def _parse_education(text: str) -> List[Dict[str, Any]]:
        if not text:
            return []
        entries = re.split(r"\n{2,}|\n(?=[A-Z])", text)
        result = []
        for entry in entries[:5]:
            if entry.strip():
                result.append({"description": entry.strip()})
        return result

    @staticmethod
    def _parse_experience(text: str) -> List[Dict[str, Any]]:
        if not text:
            return []
        entries = re.split(r"\n{2,}", text)
        result = []
        for entry in entries[:10]:
            if entry.strip():
                lines = entry.strip().split("\n")
                result.append(
                    {
                        "title": lines[0] if lines else "",
                        "description": "\n".join(lines[1:]) if len(lines) > 1 else entry.strip(),
                    }
                )
        return result

    @staticmethod
    def _parse_projects(text: str) -> List[Dict[str, Any]]:
        return ResumeParserService._parse_experience(text)

    @staticmethod
    def _extract_inline_skills(text: str) -> List[str]:
        common_skills = [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
            "React", "Angular", "Vue", "Node.js", "FastAPI", "Django", "Flask",
            "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes",
            "AWS", "Azure", "GCP", "Git", "CI/CD", "Machine Learning", "AI",
            "TensorFlow", "PyTorch", "HTML", "CSS", "Tailwind", "REST API",
            "GraphQL", "Linux", "Agile", "Scrum", "Leadership", "Communication",
        ]
        found = []
        text_lower = text.lower()
        for skill in common_skills:
            if skill.lower() in text_lower:
                found.append(skill)
        return found[:25]
