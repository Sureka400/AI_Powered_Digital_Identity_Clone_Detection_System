from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.fake_profile import router as profile_router
from routers.fake_spammer import router as spammer_router
from routers.username_similarity import router as username_router
from routers.bio_similarity import router as bio_router
from routers.verify_face import router as face_router
from routers.analyze import router as analyze_router
from routers.explainability import router as explain_router
from routers.recommendation import router as recommendation_router
from routers.history import router as history_router
from routers.report import router as report_router

app = FastAPI(
    title="AI Clone Detection API",
    description="AI Powered Digital Identity Clone Detection System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router)
app.include_router(spammer_router)
app.include_router(username_router)
app.include_router(bio_router)
app.include_router(face_router)
app.include_router(analyze_router)
app.include_router(explain_router)
app.include_router(recommendation_router)
app.include_router(history_router)
app.include_router(report_router)


@app.get("/", tags=["Home"])
def home():
    return {
        "message": "AI Powered Digital Identity Clone Detection System API",
        "status": "Running",
        "version": "1.0.0"
    }