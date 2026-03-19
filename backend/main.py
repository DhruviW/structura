import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze import router as analyze_router
from app.api.export_dxf import router as dxf_router
from app.api.projects import router as projects_router

app = FastAPI(title="Structural Analysis API", version="0.1.0")

# CORS_ORIGINS env var: comma-separated list of allowed origins.
# Defaults to localhost dev server; set to your Vercel URL in production.
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


@app.get("/health")
def health_check():
    return {"status": "ok"}
