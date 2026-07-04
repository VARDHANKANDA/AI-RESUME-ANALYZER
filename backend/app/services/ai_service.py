"""AI-powered resume analysis using OpenAI or Ollama."""

import json
import re
from typing import Any, Dict, Optional, Tuple

import httpx
from openai import OpenAI

from app.config import get_settings

settings = get_settings()


ANALYSIS_SYSTEM_PROMPT = """You are an expert ATS resume analyzer and career coach.
Analyze resumes thoroughly and return ONLY valid JSON matching the requested schema.
Be specific, actionable, and professional. Scores should be 0-100 integers."""

RESUME_ANALYSIS_SCHEMA = {
    "summary": "string - brief resume summary",
    "strengths": ["list of candidate strengths"],
    "weaknesses": ["list of candidate weaknesses"],
    "missing_skills": ["skills not found but commonly expected"],
    "missing_keywords": ["ATS keywords missing from resume"],
    "ats_score": "integer 0-100",
    "ats_breakdown": {
        "skills_match": "0-100",
        "experience": "0-100",
        "education": "0-100",
        "formatting": "0-100",
        "keywords": "0-100",
        "projects": "0-100",
        "certifications": "0-100",
        "grammar": "0-100",
    },
    "grammar_suggestions": ["specific grammar improvements"],
    "formatting_suggestions": ["formatting improvements for ATS"],
    "readability_feedback": ["readability improvements"],
    "career_suggestions": ["career development suggestions"],
    "ai_suggestions": ["actionable resume improvement suggestions"],
    "optimized_sections": {
        "professional_summary": "improved summary text",
        "skills_section": "improved skills section",
        "experience": [{"title": "...", "description": "..."}],
        "projects": [{"title": "...", "description": "..."}],
        "achievements": ["improved achievement bullets"],
    },
}

COMPARE_SCHEMA = {
    "match_percentage": "integer 0-100",
    "matching_skills": ["skills that match job requirements"],
    "missing_skills": ["required skills not in resume"],
    "matching_keywords": ["matching ATS keywords"],
    "missing_keywords": ["missing ATS keywords from job description"],
    "skill_gap_analysis": {
        "critical_gaps": ["must-have missing skills"],
        "moderate_gaps": ["nice-to-have missing skills"],
        "recommendations": ["how to close skill gaps"],
    },
    "summary": "comparison summary",
    "strengths": ["relevant strengths for this job"],
    "weaknesses": ["gaps for this specific job"],
    "ats_score": "integer 0-100",
    "ats_breakdown": RESUME_ANALYSIS_SCHEMA["ats_breakdown"],
    "grammar_suggestions": [],
    "formatting_suggestions": [],
    "readability_feedback": [],
    "career_suggestions": [],
    "ai_suggestions": [],
    "optimized_sections": RESUME_ANALYSIS_SCHEMA["optimized_sections"],
}


class AIService:
    """Unified AI service supporting OpenAI and Ollama providers."""

    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.client = None
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze_resume(
        self, resume_text: str, parsed_data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], int]:
        prompt = f"""Analyze this resume and provide comprehensive ATS analysis.

PARSED RESUME DATA:
{json.dumps(parsed_data, indent=2)}

FULL RESUME TEXT:
{resume_text[:8000]}

Return JSON with this exact structure:
{json.dumps(RESUME_ANALYSIS_SCHEMA, indent=2)}"""

        result, tokens = await self._call_ai(prompt, ANALYSIS_SYSTEM_PROMPT)
        return self._normalize_analysis(result), tokens

    async def compare_resume_job(
        self,
        resume_text: str,
        parsed_data: Dict[str, Any],
        job_text: str,
        job_parsed: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], int]:
        prompt = f"""Compare this resume against the job description.

RESUME PARSED DATA:
{json.dumps(parsed_data, indent=2)}

RESUME TEXT:
{resume_text[:6000]}

JOB DESCRIPTION PARSED:
{json.dumps(job_parsed, indent=2)}

JOB DESCRIPTION:
{job_text[:4000]}

Return JSON with this exact structure:
{json.dumps(COMPARE_SCHEMA, indent=2)}"""

        result, tokens = await self._call_ai(prompt, ANALYSIS_SYSTEM_PROMPT)
        return self._normalize_comparison(result), tokens

    async def generate_cover_letter(
        self, resume_data: Dict[str, Any], job_text: str, tone: str = "professional"
    ) -> Tuple[str, int]:
        prompt = f"""Write a {tone} cover letter based on:

RESUME: {json.dumps(resume_data, indent=2)}
JOB: {job_text[:3000]}

Return JSON: {{"cover_letter": "full cover letter text"}}"""
        result, tokens = await self._call_ai(prompt, ANALYSIS_SYSTEM_PROMPT)
        return result.get("cover_letter", ""), tokens

    async def generate_interview_questions(
        self, resume_data: Dict[str, Any], job_text: str, count: int = 10
    ) -> Tuple[list, int]:
        prompt = f"""Generate {count} interview questions based on resume and job.

RESUME: {json.dumps(resume_data, indent=2)}
JOB: {job_text[:3000]}

Return JSON: {{"questions": [{{"question": "...", "category": "technical|behavioral|situational", "tips": "..."}}]}}"""
        result, tokens = await self._call_ai(prompt, ANALYSIS_SYSTEM_PROMPT)
        return result.get("questions", []), tokens

    async def optimize_section(self, section: str, content: str, context: str = "") -> Tuple[str, int]:
        prompt = f"""Optimize this resume {section} for ATS compatibility.
Use strong action verbs and measurable results.

CONTEXT: {context}
CURRENT {section.upper()}:
{content}

Return JSON: {{"optimized": "improved text"}}"""
        result, tokens = await self._call_ai(prompt, ANALYSIS_SYSTEM_PROMPT)
        return result.get("optimized", content), tokens

    async def _call_ai(self, prompt: str, system: str) -> Tuple[Dict[str, Any], int]:
        if self.provider == "ollama":
            return await self._call_ollama(prompt, system)
        return await self._call_openai(prompt, system)

    async def _call_openai(self, prompt: str, system: str) -> Tuple[Dict[str, Any], int]:
        if not self.client:
            return self._fallback_analysis(prompt), 0

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            tokens = response.usage.total_tokens if response.usage else 0
            return self._parse_json(content), tokens
        except Exception:
            return self._fallback_analysis(prompt), 0

    async def _call_ollama(self, prompt: str, system: str) -> Tuple[Dict[str, Any], int]:
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/chat",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "messages": [
                            {"role": "system", "content": system + "\nRespond with valid JSON only."},
                            {"role": "user", "content": prompt},
                        ],
                        "stream": False,
                        "format": "json",
                    },
                )
                response.raise_for_status()
                data = response.json()
                content = data.get("message", {}).get("content", "{}")
                return self._parse_json(content), 0
        except Exception:
            return self._fallback_analysis(prompt), 0

    @staticmethod
    def _parse_json(content: str) -> Dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
        return {}

    @staticmethod
    def _normalize_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
        breakdown = data.get("ats_breakdown") or {}
        default_breakdown = {
            "skills_match": 70, "experience": 70, "education": 70, "formatting": 75,
            "keywords": 65, "projects": 70, "certifications": 60, "grammar": 80,
        }
        for key in default_breakdown:
            if key not in breakdown:
                breakdown[key] = default_breakdown[key]

        return {
            "summary": data.get("summary", "Analysis completed."),
            "strengths": data.get("strengths", [])[:10],
            "weaknesses": data.get("weaknesses", [])[:10],
            "missing_skills": data.get("missing_skills", [])[:15],
            "missing_keywords": data.get("missing_keywords", [])[:15],
            "ats_score": min(100, max(0, int(data.get("ats_score", 70)))),
            "ats_breakdown": {k: min(100, max(0, float(v))) for k, v in breakdown.items()},
            "grammar_suggestions": data.get("grammar_suggestions", [])[:10],
            "formatting_suggestions": data.get("formatting_suggestions", [])[:10],
            "readability_feedback": data.get("readability_feedback", [])[:10],
            "career_suggestions": data.get("career_suggestions", [])[:10],
            "ai_suggestions": data.get("ai_suggestions", [])[:15],
            "optimized_sections": data.get("optimized_sections", {}),
            "matching_skills": None,
            "matching_keywords": None,
            "match_percentage": None,
            "skill_gap_analysis": None,
        }

    @staticmethod
    def _normalize_comparison(data: Dict[str, Any]) -> Dict[str, Any]:
        base = AIService._normalize_analysis(data)
        base["match_percentage"] = min(100, max(0, int(data.get("match_percentage", 65))))
        base["matching_skills"] = data.get("matching_skills", [])[:20]
        base["matching_keywords"] = data.get("matching_keywords", [])[:20]
        base["missing_skills"] = data.get("missing_skills", base["missing_skills"])[:20]
        base["missing_keywords"] = data.get("missing_keywords", base["missing_keywords"])[:20]
        base["skill_gap_analysis"] = data.get("skill_gap_analysis", {})
        return base

    @staticmethod
    def _fallback_analysis(prompt: str) -> Dict[str, Any]:
        """Rule-based fallback when AI is unavailable."""
        text_lower = prompt.lower()
        skills_found = sum(
            1 for s in ["python", "javascript", "react", "sql", "java", "aws", "docker"]
            if s in text_lower
        )
        base_score = min(85, 50 + skills_found * 5)

        return {
            "summary": "Resume analyzed using rule-based engine. Connect OpenAI or Ollama for AI-powered insights.",
            "strengths": ["Structured resume content detected", "Professional formatting present"],
            "weaknesses": ["Enable AI provider for deeper analysis", "Consider adding quantifiable achievements"],
            "missing_skills": ["Cloud computing", "CI/CD", "System design"],
            "missing_keywords": ["agile", "leadership", "cross-functional"],
            "ats_score": base_score,
            "ats_breakdown": {
                "skills_match": base_score, "experience": base_score - 5,
                "education": 75, "formatting": 80, "keywords": base_score - 10,
                "projects": 70, "certifications": 60, "grammar": 85,
            },
            "grammar_suggestions": ["Review verb tense consistency", "Use active voice throughout"],
            "formatting_suggestions": ["Use standard section headings", "Avoid tables and graphics for ATS"],
            "readability_feedback": ["Keep bullet points concise", "Lead with action verbs"],
            "career_suggestions": ["Add certifications relevant to target role", "Include metrics in achievements"],
            "ai_suggestions": [
                "Add measurable results to each bullet point",
                "Include keywords from target job descriptions",
                "Strengthen professional summary with value proposition",
            ],
            "optimized_sections": {
                "professional_summary": "Results-driven professional with proven expertise...",
                "skills_section": "Technical Skills: Python, JavaScript, React, SQL, Docker, AWS",
                "experience": [],
                "projects": [],
                "achievements": ["Increased efficiency by 30% through process optimization"],
            },
            "match_percentage": base_score,
            "matching_skills": ["Python", "JavaScript"] if "python" in text_lower else [],
            "matching_keywords": [],
            "skill_gap_analysis": {
                "critical_gaps": ["Enable AI for detailed gap analysis"],
                "moderate_gaps": [],
                "recommendations": ["Configure OPENAI_API_KEY or Ollama for full analysis"],
            },
        }


ai_service = AIService()
