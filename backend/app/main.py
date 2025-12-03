from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes_plan import router as plan_router
from app.api.v1.users import router as users_router


app = FastAPI(title="AI Meal Planner (Python)")

_origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://meal-planner-ai-front.vercel.app",
}
if settings.FRONTEND_ORIGIN:
    _origins.add(str(settings.FRONTEND_ORIGIN))

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-OpenRouter-API-Key",
        "Accept",
    ],
)


@app.get("/healthz")
async def healthz():
	return {"status": "ok"}


app.include_router(plan_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
