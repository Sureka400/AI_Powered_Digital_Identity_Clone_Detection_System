"""Tests for threat-specific PDF report colours and labels."""

import unittest

from services.report_service import ReportService


class ReportThreatTests(unittest.TestCase):
    def test_genuine_report_uses_green(self):
        threat = ReportService._threat({"status": "Genuine", "trust_score": 90})
        self.assertEqual(threat["level"], "GENUINE")
        self.assertEqual(threat["color"], "#087A5A")

    def test_suspicious_report_uses_amber(self):
        threat = ReportService._threat({"status": "Suspicious", "trust_score": 60})
        self.assertEqual(threat["level"], "SUSPICIOUS")
        self.assertEqual(threat["color"], "#B87500")

    def test_clone_report_uses_red(self):
        threat = ReportService._threat({"status": "Clone Detected", "trust_score": 20})
        self.assertEqual(threat["level"], "CLONE DETECTED")
        self.assertEqual(threat["color"], "#C6284E")


if __name__ == "__main__":
    unittest.main()
