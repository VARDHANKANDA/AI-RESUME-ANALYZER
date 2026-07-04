"""PDF report generation for analysis results."""

import io
from datetime import datetime
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class ReportService:
    """Generate downloadable PDF analysis reports."""

    @staticmethod
    def generate_analysis_pdf(analysis: Dict[str, Any], resume_name: str = "Resume") -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle", parent=styles["Heading1"], fontSize=22, spaceAfter=20,
            textColor=colors.HexColor("#1e40af"),
        )
        heading_style = ParagraphStyle(
            "CustomHeading", parent=styles["Heading2"], fontSize=14, spaceAfter=10,
            textColor=colors.HexColor("#1e3a8a"),
        )

        story = []
        story.append(Paragraph("AI Resume Analyzer - Analysis Report", title_style))
        story.append(Paragraph(f"Resume: {resume_name}", styles["Normal"]))
        story.append(Paragraph(
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]
        ))
        story.append(Spacer(1, 20))

        story.append(Paragraph(f"ATS Score: {analysis.get('ats_score', 0)}/100", heading_style))
        if analysis.get("match_percentage"):
            story.append(Paragraph(
                f"Job Match: {analysis['match_percentage']}%", styles["Normal"]
            ))

        breakdown = analysis.get("ats_breakdown") or {}
        if breakdown:
            story.append(Spacer(1, 10))
            story.append(Paragraph("Score Breakdown", heading_style))
            table_data = [["Category", "Score"]] + [
                [k.replace("_", " ").title(), f"{v}/100"] for k, v in breakdown.items()
            ]
            table = Table(table_data, colWidths=[3 * inch, 1.5 * inch])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4ff")]),
            ]))
            story.append(table)

        story.append(Spacer(1, 15))
        if analysis.get("summary"):
            story.append(Paragraph("Summary", heading_style))
            story.append(Paragraph(analysis["summary"], styles["Normal"]))

        for section_key, title in [
            ("strengths", "Strengths"),
            ("weaknesses", "Weaknesses"),
            ("missing_skills", "Missing Skills"),
            ("ai_suggestions", "Improvement Suggestions"),
        ]:
            items = analysis.get(section_key) or []
            if items:
                story.append(Spacer(1, 10))
                story.append(Paragraph(title, heading_style))
                for item in items[:10]:
                    story.append(Paragraph(f"• {item}", styles["Normal"]))

        doc.build(story)
        buffer.seek(0)
        return buffer.read()
