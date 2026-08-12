"""PDF investigation report generation."""

import os
import re
from datetime import datetime, timezone
from typing import Any
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


PAGE_WIDTH, PAGE_HEIGHT = A4
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#607087")
PANEL = colors.HexColor("#F7F9FC")


class ReportService:
    """Creates a readable, threat-aware PDF from an investigation payload."""

    @staticmethod
    def _number(value: Any, default: float = 0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _percent(value: Any) -> str:
        if value is None or value == "":
            return "Not available"
        return f"{max(0, min(100, ReportService._number(value))):.1f}%"

    @staticmethod
    def _clean(value: Any, fallback: str = "Not available") -> str:
        text = str(value).strip() if value is not None else ""
        return escape(text) if text else fallback

    @staticmethod
    def _threat(report: dict[str, Any]) -> dict[str, str]:
        decision = " ".join(
            str(report.get(key) or "")
            for key in ("decision", "decision_label", "risk_level", "status")
        ).lower()
        trust = ReportService._number(report.get("trust_score"), 50)

        # Keep the report's visual language aligned with the final analysis
        # result: green for genuine, amber for suspicious, and red for clones.
        if any(word in decision for word in ("clone", "fake", "critical", "high")) or trust < 50:
            return {
                "level": "CLONE DETECTED",
                "headline": "Identity clone detected",
                "summary": "The combined signals indicate a likely impersonation attempt. Treat the suspected profile as unsafe until a manual review is complete.",
                "action": "Preserve the evidence, report the suspected profile, and verify the identity through a trusted channel before further engagement.",
                "color": "#C6284E",
                "pale": "#FDEEF2",
            }
        if any(word in decision for word in ("suspicious", "moderate", "medium")) or trust < 75:
            return {
                "level": "SUSPICIOUS",
                "headline": "Suspicious identity signals found",
                "summary": "Some profile attributes resemble the original account, but the available evidence is not conclusive on its own.",
                "action": "Verify the account through a trusted channel, monitor for changes, and collect additional evidence before taking enforcement action.",
                "color": "#B87500",
                "pale": "#FFF7E5",
            }
        return {
            "level": "GENUINE",
            "headline": "Profile appears genuine",
            "summary": "The current analysis indicates a low likelihood of identity cloning. Continue normal monitoring as new information becomes available.",
            "action": "No urgent action is required. Retain this report for audit purposes and re-run the analysis if the profile changes.",
            "color": "#087A5A",
            "pale": "#EAF8F2",
        }

    @staticmethod
    def _styles() -> dict[str, ParagraphStyle]:
        base = getSampleStyleSheet()
        return {
            "eyebrow": ParagraphStyle("Eyebrow", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=MUTED, spaceAfter=3, tracking=0.8),
            "title": ParagraphStyle("Title", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=23, leading=28, textColor=INK),
            "section": ParagraphStyle("Section", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=INK, spaceBefore=8, spaceAfter=7),
            "body": ParagraphStyle("Body", parent=base["Normal"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=INK),
            "small": ParagraphStyle("Small", parent=base["Normal"], fontName="Helvetica", fontSize=8, leading=10, textColor=MUTED),
            "card_label": ParagraphStyle("CardLabel", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=7.5, leading=9, textColor=MUTED),
            "card_value": ParagraphStyle("CardValue", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=15, leading=18, textColor=INK),
            "badge": ParagraphStyle("Badge", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=13, textColor=colors.white, alignment=TA_CENTER),
        }

    @staticmethod
    def _metric_card(label: str, value: str, styles: dict[str, ParagraphStyle]) -> Table:
        table = Table([[Paragraph(label.upper(), styles["card_label"])], [Paragraph(value, styles["card_value"])]], colWidths=[42 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E1E7EF")),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ]))
        return table

    @staticmethod
    def generate(report: dict[str, Any]) -> str:
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        base = re.sub(r"[^A-Za-z0-9_.-]", "_", str(report.get("id") or report.get("username") or "investigation_report"))
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        filename = os.path.join(reports_dir, f"{base}_{timestamp}.pdf")

        threat = ReportService._threat(report)
        accent = colors.HexColor(threat["color"])
        styles = ReportService._styles()
        doc = SimpleDocTemplate(
            filename,
            pagesize=A4,
            rightMargin=16 * mm,
            leftMargin=16 * mm,
            topMargin=16 * mm,
            bottomMargin=16 * mm,
            title="AI Clone Detection Investigation Report",
            author="AI Powered Digital Identity Clone Detection System",
        )

        def draw_page(canvas, document):
            canvas.saveState()
            canvas.setStrokeColor(colors.HexColor("#DFE6EF"))
            canvas.setLineWidth(0.5)
            canvas.line(16 * mm, 12 * mm, PAGE_WIDTH - 16 * mm, 12 * mm)
            canvas.setFont("Helvetica", 7.5)
            canvas.setFillColor(MUTED)
            canvas.drawString(16 * mm, 8 * mm, "AI Powered Digital Identity Clone Detection System")
            canvas.drawRightString(PAGE_WIDTH - 16 * mm, 8 * mm, f"Confidential investigation report  |  Page {document.page}")
            canvas.restoreState()

        generated = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
        report_id = ReportService._clean(report.get("id"), "Pending investigation")
        original = ReportService._clean(report.get("original_username") or report.get("profile_name"), "Original profile not supplied")
        clone = ReportService._clean(report.get("clone_username") or report.get("username"), "Suspected profile not supplied")
        trust = max(0, min(100, ReportService._number(report.get("trust_score"), 0)))
        clone_probability = report.get("clone_probability")
        if clone_probability is None:
            clone_probability = 100 - trust

        story = []
        header = Table([
            [Paragraph("IDENTITY SECURITY / INVESTIGATION REPORT", styles["eyebrow"]), ""],
            [Paragraph("AI Clone Detection Report", styles["title"]), Paragraph(threat["level"] + " THREAT", styles["badge"])],
            [Paragraph(f"Report ID: <b>{report_id}</b><br/>Generated: {generated}", styles["small"]), ""],
        ], colWidths=[132 * mm, 46 * mm])
        header.setStyle(TableStyle([
            ("SPAN", (0, 0), (1, 0)),
            ("SPAN", (0, 2), (1, 2)),
            ("BACKGROUND", (1, 1), (1, 1), accent),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 1), (1, 1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1.5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5 * mm),
        ]))
        story += [header, Spacer(1, 5 * mm), HRFlowable(width="100%", thickness=1.5, color=accent), Spacer(1, 4 * mm)]

        assessment = Table([[Paragraph(f"<b>{threat['headline']}</b><br/>{threat['summary']}", styles["body"])]], colWidths=[178 * mm])
        assessment.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(threat["pale"])),
            ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
            ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
        ]))
        story += [assessment, Spacer(1, 5 * mm), Paragraph("Assessment at a glance", styles["section"])]

        metrics = Table([[
            ReportService._metric_card("Threat level", threat["level"].title(), styles),
            ReportService._metric_card("Trust score", f"{trust:.0f} / 100", styles),
            ReportService._metric_card("Clone likelihood", ReportService._percent(clone_probability), styles),
            ReportService._metric_card("Decision", ReportService._clean(report.get("decision") or report.get("decision_label") or report.get("status") or report.get("risk_level")), styles),
        ]], colWidths=[44.5 * mm] * 4)
        metrics.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 1.8 * mm)]))
        story += [metrics, Spacer(1, 5 * mm)]

        evidence = [
            ("Face similarity", ReportService._percent(report.get("face_similarity")), "High values can indicate visual identity overlap."),
            ("Username similarity", ReportService._percent(report.get("username_similarity")), "Similar handles can be used to impersonate an account."),
            ("Biography similarity", ReportService._percent(report.get("bio_similarity")), "Similar biography text can indicate copied profile content."),
            ("Face verification", "Match" if report.get("face_verified") else "No match / not verified", "A verification match is treated as an additional identity-overlap signal."),
        ]
        story += [Paragraph("Evidence summary", styles["section"])]
        evidence_rows = [[Paragraph("SIGNAL", styles["card_label"]), Paragraph("OBSERVATION", styles["card_label"]), Paragraph("WHY IT MATTERS", styles["card_label"])]]
        for label, value, note in evidence:
            evidence_rows.append([Paragraph(label, styles["body"]), Paragraph(f"<b>{value}</b>", styles["body"]), Paragraph(note, styles["small"])])
        evidence_table = Table(evidence_rows, colWidths=[42 * mm, 42 * mm, 94 * mm], repeatRows=1)
        evidence_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAF0F6")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#DDE5EE")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 3.2 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3.2 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ]))
        story += [evidence_table, Spacer(1, 5 * mm)]

        story += [Paragraph("Profiles reviewed", styles["section"])]
        profiles = Table([
            [Paragraph("ORIGINAL PROFILE", styles["card_label"]), Paragraph("SUSPECTED PROFILE", styles["card_label"])],
            [Paragraph(f"<b>@{original}</b>", styles["body"]), Paragraph(f"<b>@{clone}</b>", styles["body"])]
        ], colWidths=[89 * mm, 89 * mm])
        profiles.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#E7F8FA")),
            ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#F2EDFF")),
            ("BACKGROUND", (0, 1), (-1, 1), PANEL),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDE5EE")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDE5EE")),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ]))
        story += [profiles, Spacer(1, 5 * mm)]

        recommendation = ReportService._clean(report.get("recommendation"), threat["action"])
        action = Table([[Paragraph("RECOMMENDED NEXT STEP", styles["card_label"])], [Paragraph(recommendation, styles["body"])]] , colWidths=[178 * mm])
        action.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), accent),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor(threat["pale"])),
            ("BOX", (0, 0), (-1, -1), 0.5, accent),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ]))
        story += [KeepTogether([
            action,
            Spacer(1, 4 * mm),
            Paragraph("Interpretation note", styles["section"]),
            Paragraph("This report is a decision-support record generated from the supplied profile and model signals. It should be reviewed alongside platform evidence and applicable policies before irreversible action is taken.", styles["small"]),
        ])]

        doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
        return filename
