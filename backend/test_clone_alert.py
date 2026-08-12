"""Regression tests for clone-detection email alerts.

Run from ``backend/`` with: ``python -m unittest test_clone_alert``.
"""

import asyncio
import unittest
from unittest.mock import patch

from routers.analyze import analyze_profile
from schemas.analyze_schema import AnalyzeRequest


class CloneAlertTests(unittest.TestCase):
    def setUp(self):
        self.clone_request = AnalyzeRequest(
            profile_fake=True,
            spammer=True,
            username_similarity=95,
            bio_similarity=95,
            face_similarity=95,
            face_verified=True,
            original_username="original-user",
            clone_username="suspected-clone",
            alert_email="analyst@example.com",
        )

    def test_clone_detection_sends_alert_to_signed_in_email(self):
        with (
            patch("routers.analyze.HistoryService.save"),
            patch("routers.analyze.send_email") as send_email,
        ):
            response = asyncio.run(analyze_profile(self.clone_request))

        self.assertEqual(response.status, "Clone Detected")
        self.assertTrue(response.alert_sent)
        self.assertIsNone(response.alert_error)
        send_email.assert_called_once()
        self.assertEqual(send_email.call_args.args[0], "analyst@example.com")

    def test_clone_detection_without_email_does_not_send_alert(self):
        request = self.clone_request.model_copy(update={"alert_email": None})
        with (
            patch("routers.analyze.HistoryService.save"),
            patch("routers.analyze.send_email") as send_email,
        ):
            response = asyncio.run(analyze_profile(request))

        self.assertFalse(response.alert_sent)
        self.assertIn("No valid signed-in analyst email", response.alert_error)
        send_email.assert_not_called()


if __name__ == "__main__":
    unittest.main()
