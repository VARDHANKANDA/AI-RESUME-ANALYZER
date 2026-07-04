"""Job description parsing service."""

import re
from typing import Any, Dict, List


class JobDescriptionParser:
    """Extract structured data from job description text."""

    @staticmethod
    def parse(text: str) -> Dict[str, Any]:
        sections = JobDescriptionParser._split_sections(text)
        return {
            "required_skills": JobDescriptionParser._extract_skills(text, sections),
            "responsibilities": JobDescriptionParser._extract_list(
                sections.get("responsibilities", text[:2000])
            ),
            "qualifications": JobDescriptionParser._extract_list(
                sections.get("qualifications", "")
            ),
            "experience": JobDescriptionParser._extract_experience(text),
            "preferred_technologies": JobDescriptionParser._extract_technologies(text),
        }

    @staticmethod
    def _split_sections(text: str) -> Dict[str, str]:
        patterns = {
            "responsibilities": r"(?:responsibilities|duties|what you.ll do|role overview)",
            "qualifications": r"(?:qualifications|requirements|what we.re looking for|must have)",
            "skills": r"(?:skills|technical skills|required skills)",
            "experience": r"(?:experience|years of experience)",
        }
        lines = text.split("\n")
        sections: Dict[str, str] = {}
        current = "general"
        buffer: List[str] = []

        for line in lines:
            stripped = line.strip()
            matched = None
            for key, pattern in patterns.items():
                if re.match(rf"^{pattern}\s*:?\s*$", stripped, re.IGNORECASE):
                    if buffer:
                        sections[current] = "\n".join(buffer)
                    current = key
                    buffer = []
                    matched = key
                    break
            if not matched:
                buffer.append(line)

        if buffer:
            sections[current] = "\n".join(buffer)
        return sections

    @staticmethod
    def _extract_list(text: str) -> List[str]:
        if not text:
            return []
        items = re.split(r"\n(?=[•\-\*])|[•\-\*]\s*", text)
        return [i.strip() for i in items if i.strip() and len(i.strip()) > 5][:20]

    @staticmethod
    def _extract_skills(text: str, sections: Dict[str, str]) -> List[str]:
        skill_text = sections.get("skills", "") + " " + text
        tech_keywords = [
            "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Vue",
            "Node.js", "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes",
            "FastAPI", "Django", "Spring", "C++", "Go", "Rust", "Machine Learning",
            "AI", "TensorFlow", "PyTorch", "Git", "CI/CD", "Agile", "Scrum",
            "REST", "GraphQL", "Microservices", "Linux", "Azure", "GCP",
        ]
        found = []
        lower = skill_text.lower()
        for kw in tech_keywords:
            if kw.lower() in lower:
                found.append(kw)
        return list(dict.fromkeys(found))[:25]

    @staticmethod
    def _extract_experience(text: str) -> str:
        match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience)?", text, re.I)
        return match.group(0) if match else "Not specified"

    @staticmethod
    def _extract_technologies(text: str) -> List[str]:
        match = re.findall(
            r"\b(?:React|Angular|Vue|Python|Java|AWS|Docker|Kubernetes|SQL|MongoDB|"
            r"PostgreSQL|TypeScript|JavaScript|Node\.js|FastAPI|Django|Spring)\b",
            text,
            re.I,
        )
        return list(dict.fromkeys(m.title() if t.lower() != "node.js" else "Node.js" for t in match))[:15]
