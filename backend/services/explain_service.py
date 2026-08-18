import os

from dotenv import load_dotenv
from groq import Groq

from utils.explainability import explain_prediction


# Load .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Create Groq client
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


class ExplainService:

    @staticmethod
    def explain(
        profile_fake,
        spammer,
        username_similarity,
        bio_similarity,
        face_similarity,
        face_verified,
    ):

        # -----------------------------------------
        # 1. Existing rule-based explanation
        # -----------------------------------------

        reasons = explain_prediction(
            profile_fake,
            spammer,
            username_similarity,
            bio_similarity,
            face_similarity,
            face_verified,
        )

        # -----------------------------------------
        # 2. Check Groq configuration
        # -----------------------------------------

        if client is None:

            return {
                "reasons": (
                    "Groq Explainable AI is not configured.\n\n"
                    "Please add GROQ_API_KEY to backend/.env\n\n"
                    "Existing model explanation:\n"
                    f"{reasons}"
                )
            }

        # -----------------------------------------
        # 3. Prepare Explainable AI prompt
        # -----------------------------------------

        prompt = f"""
You are an Explainable AI cybersecurity analyst.

You are analyzing the output of a Digital Identity Clone
Detection System.

The machine-learning models produced the following results:

Profile Fake Prediction: {profile_fake}
Spammer Prediction: {spammer}
Username Similarity: {username_similarity}%
Bio Similarity: {bio_similarity}%
Face Similarity: {face_similarity}%
Face Verified: {face_verified}

Existing rule-based explanation:
{reasons}

Your task is to explain WHY the system considers the
profile suspicious or not suspicious.

IMPORTANT RULES:

1. Use ONLY the evidence provided above.
2. Do not invent any additional evidence.
3. Do not claim that a person is definitely fraudulent.
4. Explain which factors increase suspicion.
5. Explain which factors reduce suspicion.
6. Clearly distinguish model prediction from certainty.
7. Use simple language suitable for a cybersecurity investigator.
8. If a similarity value is 0, do not claim that similarity
   was detected.
9. If face_verified is true, mention that as supporting evidence
   but do not treat it as proof of identity by itself.

Return exactly this structure:

Overall Assessment:
<short explanation>

Key Evidence:
- <evidence 1>
- <evidence 2>
- <evidence 3>

Why Suspicious:
<explanation of factors increasing risk>

Why Not Suspicious:
<explanation of factors reducing risk>

Risk Level:
<LOW / MEDIUM / HIGH / CRITICAL>

Final Conclusion:
<short conclusion>
"""

        # -----------------------------------------
        # 4. Ask Groq
        # -----------------------------------------

        try:

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an Explainable AI cybersecurity "
                            "analyst. Explain machine-learning results "
                            "without inventing evidence."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.2,
                max_tokens=1000,
            )

            ai_explanation = response.choices[0].message.content

            if not ai_explanation:
                ai_explanation = (
                    "Groq did not return an explanation.\n\n"
                    f"Existing model explanation:\n{reasons}"
                )

        except Exception as e:

            # -----------------------------------------
            # 5. Fallback to existing explanation
            # -----------------------------------------

            ai_explanation = (
                "Groq Explainable AI is currently unavailable.\n\n"
                "Existing model explanation:\n"
                f"{reasons}\n\n"
                f"Error: {str(e)}"
            )

        return {
            "reasons": ai_explanation
        }
