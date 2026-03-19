from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze import router as analyze_router
from app.api.export_dxf import router as dxf_router
from app.api.projects import router as projects_router

app = FastAPI(title="Structural Analysis API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
