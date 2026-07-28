from reportlab.pdfgen import canvas
import os


class ReportService:

    @staticmethod
    def generate(report):

        os.makedirs("reports", exist_ok=True)

        username = report.get("username", "unknown_profile")

        filename = f"reports/{username}.pdf"

        c = canvas.Canvas(filename)

        c.drawString(50, 800, "AI Clone Detection Report")

        y = 760

        for key, value in report.items():

            c.drawString(50, y, f"{key}: {value}")

            y -= 25

            # prevent writing outside PDF page
            if y < 50:
                c.showPage()
                y = 800

        c.save()

        return filename