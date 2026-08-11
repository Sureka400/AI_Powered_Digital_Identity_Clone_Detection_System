import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


class RecommendationService:

    @staticmethod
    def recommend(
        status,
        trust_score,
        risk,
        profile_fake,
        spammer,
        username_similarity,
        bio_similarity,
        face_similarity,
        face_verified,
        original_username,
        clone_username,
    ):

        # ------------------------------------------------
        # Fallback if Groq is not configured
        # ------------------------------------------------

        if client is None:
            return {
                "recommendations": [
                    {
                        "title": "Manual Review",
                        "description": "Review the profile manually.",
                        "priority": "Medium",
                        "action": "Review"
                    }
                ]
            }

        # ------------------------------------------------
        # Information sent to Groq
        # ------------------------------------------------

        prompt = f"""
You are a cybersecurity recommendation engine.

You are analyzing a Digital Identity Clone Detection System.

Here are the actual machine-learning results:

Status: {status}
Trust Score: {trust_score}/100
Risk Level: {risk}

Fake Profile Prediction: {profile_fake}
Spammer Prediction: {spammer}

Username Similarity: {username_similarity}%
Bio Similarity: {bio_similarity}%
Face Similarity: {face_similarity}%
Face Verified: {face_verified}

Original Username: {original_username}
Suspected Clone Username: {clone_username}

Generate recommendations based ONLY on these results.

IMPORTANT RULES:

1. Recommendations must depend on the actual risk and model results.
2. Do NOT always return the same recommendations.
3. If risk is LOW, recommend monitoring and normal verification.
4. If risk is MEDIUM, recommend manual investigation.
5. If risk is HIGH, recommend stronger security actions.
6. If risk is CRITICAL, prioritize immediate investigation,
   reporting and containment.
7. If profile_fake is false, do not recommend reporting the
   account as a confirmed clone.
8. If spammer is false, do not claim that spam behavior was detected.
9. Do not invent evidence.
10. Do not claim that the person is definitely fraudulent.
11. Give 3 to 5 recommendations.
12. Prioritize recommendations according to the risk level.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{{
    "recommendations": [
        {{
            "title": "Short recommendation title",
            "description": "Specific action based on the evidence",
            "priority": "Low",
            "action": "Monitor"
        }}
    ]
}}

Allowed priority values:

Low
Medium
High
Critical

Allowed action values:

Monitor
Review
Verify
Report
Block
Investigate
Secure

Do not include markdown.
Do not include ```json.
"""

        try:

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a cybersecurity recommendation "
                            "engine. Return only valid JSON."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=1200,
            )

            content = response.choices[0].message.content.strip()

            # Remove accidental markdown fences
            if content.startswith("```"):
                content = content.replace("```json", "")
                content = content.replace("```", "")
                content = content.strip()

            result = json.loads(content)

            return result

        except Exception as e:

            print("Recommendation AI error:", str(e))

            return {
                "recommendations": [
                    {
                        "title": "Manual Investigation",
                        "description": (
                            "Review the profile manually because "
                            "the recommendation engine is unavailable."
                        ),
                        "priority": "Medium",
                        "action": "Review"
                    }
                ]
            }