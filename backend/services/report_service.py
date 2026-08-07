from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
import os
from datetime import datetime


class ReportService:

    @staticmethod
    def generate(report):

        os.makedirs("reports", exist_ok=True)

        # Build a safe filename using id/username and timestamp
        base = report.get("id") or report.get("username") or "report"
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        filename = f"reports/{base}_{ts}.pdf"

        width, height = A4
        c = canvas.Canvas(filename, pagesize=A4)

        # Title
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 60, "AI Clone Detection Report")

        # Decision badge with color
        decision = (report.get("decision") or report.get("decision_label") or report.get("risk_level") or "Unknown").lower()
        if "clone" in decision:
            badge_color = colors.HexColor('#FF3D71')
            label = 'CLONE DETECTED'
        elif "genuine" in decision:
            badge_color = colors.HexColor('#00FFA3')
            label = 'GENUINE'
        else:
            badge_color = colors.HexColor('#FFD54F')
            label = 'SUSPICIOUS'

        # Draw badge rectangle
        c.setFillColor(badge_color)
        c.rect(50, height - 100, 140, 28, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(58, height - 94, label)

        # Metadata table
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 11)
        y = height - 140

        metas = [
            ("Report ID", str(report.get("id", "-"))),
            ("Generated", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")),
            ("Original Username", str(report.get("original_username") or report.get("username") or '-')),
            ("Suspected Clone", str(report.get("clone_username") or '-')),
            ("Trust Score", str(report.get("trust_score", '-'))),
            ("Face Similarity", str(report.get("face_similarity", '-'))),
            ("Bio Similarity", str(report.get("bio_similarity", '-'))),
            ("Decision", str(report.get("decision") or report.get("decision_label") or report.get("risk_level") or '-')),
        ]

        for key, val in metas:
            c.drawString(50, y, f"{key}: ")
            c.drawString(180, y, f"{val}")
            y -= 20

        # Freeform details
        y -= 10
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Details")
        y -= 18
        c.setFont("Helvetica", 10)
        for key, value in report.items():
            # Skip fields already shown
            if key in {"id", "username", "original_username", "clone_username", "trust_score", "face_similarity", "bio_similarity", "decision", "decision_label", "risk_level"}:
                continue
            text = f"{key}: {value}"
            c.drawString(50, y, text)
            y -= 14
            if y < 60:
                c.showPage()
                y = height - 60

        c.save()
        return filename