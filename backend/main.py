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


@app.get("/debug/openseespy")
def debug_openseespy():
    """Diagnostic: check if OpenSeesPy can be imported."""
    import sys
    import platform
    info = {
        "python_version": sys.version,
        "platform": platform.platform(),
        "machine": platform.machine(),
    }
    try:
        import openseespy.opensees as ops
        ops.wipe()
        info["openseespy"] = "OK"
    except Exception as e:
        info["openseespy"] = f"FAILED: {e}"
        import subprocess, glob, traceback
        # What pip packages are installed
        result = subprocess.run(["pip", "list"], capture_output=True, text=True)
        info["pkgs"] = [l for l in result.stdout.split("\n") if "opensees" in l.lower()]
        # Find .so files
        sos = glob.glob("/usr/local/lib/python*/site-packages/*opensees*/**/*.so", recursive=True)
        info["so_files"] = sos[:10]
        # Run ldd on the .so to find missing libs
        for so in sos[:3]:
            ldd = subprocess.run(["ldd", so], capture_output=True, text=True)
            missing = [l.strip() for l in ldd.stdout.split("\n") if "not found" in l]
            if missing:
                info[f"missing_libs_{so.split('/')[-1]}"] = missing
            if ldd.returncode != 0:
                info[f"ldd_error_{so.split('/')[-1]}"] = ldd.stderr[:200]
        # Full traceback
        try:
            import openseespy.opensees
        except Exception:
            info["traceback"] = traceback.format_exc()[-500:]
    return info
