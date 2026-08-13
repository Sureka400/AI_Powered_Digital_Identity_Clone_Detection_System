from datetime import datetime
from email.utils import parseaddr

from fastapi import APIRouter
from schemas.analyze_schema import AnalyzeRequest, AnalyzeResponse
from services.analyze_service import AnalyzeService
from services.email_service import send_email
from services.history_service import HistoryService

router = APIRouter(
    prefix="/analyze",
    tags=["Trust Score Analysis"]
)


def is_valid_email(value: str | None) -> bool:
    """Keep malformed values out of the email headers."""
    if not value:
        return False
    _, address = parseaddr(value)
    return address == value and "@" in address and "." in address.rsplit("@", 1)[-1]


def normalize_email(value: str | None) -> str | None:
    if not is_valid_email(value):
        return None
    return value.strip().lower()


@router.post("/", response_model=AnalyzeResponse)
async def analyze_profile(data: AnalyzeRequest):

    result = AnalyzeService.analyze(
        profile_fake=data.profile_fake,
        spammer=data.spammer,
        username_similarity=data.username_similarity,
        bio_similarity=data.bio_similarity,
        face_similarity=data.face_similarity,
        face_verified=data.face_verified,
    )

    decision_label = "Clone" if data.profile_fake else "Genuine"
    history_entry = {
        "id": datetime.now().strftime("INV-%Y%m%d%H%M%S"),
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "analyst_email": normalize_email(data.analyst_email or data.alert_email),
        "original_username": data.original_username or "original",
        "clone_username": data.clone_username or "clone",
        "profile_fake": data.profile_fake,
        "spammer": data.spammer,
        "decision": decision_label,
        "decision_label": decision_label,
        "trust_score": result["trust_score"],
        "risk_level": result.get("status", "Unknown"),
        "status": result.get("status", "Unknown"),
        "face_verified": data.face_verified,
        "face_similarity": data.face_similarity,
        "bio_similarity": data.bio_similarity,
        "username_similarity": data.username_similarity,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    HistoryService.save(history_entry)

    alert_sent = False
    alert_error = None
    # Send the signed-in analyst an alert only for a confirmed high-risk clone.
    if result.get("status") == "Clone Detected" and not is_valid_email(data.alert_email):
        alert_error = "No valid signed-in analyst email was supplied for the clone alert."
    elif result.get("status") == "Clone Detected":
        try:
            send_email(
                data.alert_email,
                "Clone detected alert",
                f"""A suspected identity clone has been detected.

Investigation ID: {history_entry['id']}
Original profile: @{history_entry['original_username']}
Suspected clone: @{history_entry['clone_username']}
Trust score: {result['trust_score']}/100
Risk: {result['risk']}
Status: {result['status']}

Review this investigation in IDCLONE.AI before taking action.
""",
            )
            alert_sent = True
        except Exception as error:
            # Email delivery must not prevent an investigation from completing.
            alert_error = "Mail delivery failed. Check the backend SMTP configuration and server log."
            print(f"Clone alert to {data.alert_email} could not be sent: {type(error).__name__}: {error}")

    return AnalyzeResponse(
        trust_score=result["trust_score"],
        status=result["status"],
        risk=result.get("risk", "Low"),
        alert_sent=alert_sent,
        alert_error=alert_error,
    )
