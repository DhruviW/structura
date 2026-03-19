from __future__ import annotations

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze import router as analyze_router
from app.api.export_dxf import router as dxf_router
from app.api.projects import router as projects_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Structural Analysis API", version="0.1.0")

# CORS
_cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
allow_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(dxf_router)
app.include_router(projects_router)


@app.on_event("startup")
async def startup():
    try:
        from app.db.database import init_db, async_session
        from app.db.orm_models import Profile
        from sqlalchemy import select

        await init_db()

        # Ensure dev-user profile exists
        async with async_session() as session:
            existing = (
                await session.execute(select(Profile).where(Profile.id == "dev-user"))
            ).scalar_one_or_none()
            if existing is None:
                session.add(Profile(id="dev-user", display_name="Dev User"))
                await session.commit()

        logger.info("Database connected and initialized")
    except Exception as e:
        logger.warning(f"Database not available: {e}. Project features disabled, analysis still works.")


@app.on_event("shutdown")
async def shutdown():
    try:
        from app.db.database import close_db
        await close_db()
    except Exception:
        pass


@app.get("/health")
def health_check():
    return {"status": "ok"}
