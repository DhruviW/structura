# Backend Migration: PostgreSQL + Pure Python FEM Solver

**Date:** 2026-03-19
**Status:** Approved

## Summary

Two changes to make the backend production-ready and deployable:
1. Replace in-memory dict storage with local PostgreSQL via SQLAlchemy
2. Replace OpenSeesPy with a pure Python FEM solver (NumPy/SciPy only)

## Section 1: PostgreSQL with SQLAlchemy

**Stack:** PostgreSQL (local) + SQLAlchemy 2.0 (async) + asyncpg + Alembic

**Tables** (same schema as existing `001_initial.sql`):
- profiles (id, display_name, created_at)
- projects (id, name, description, owner_id, created_at, updated_at)
- project_members (project_id, user_id, role)
- model_snapshots (id, project_id, model_json JSONB, created_by, created_at, label)
- analysis_results (id, snapshot_id, results_json JSONB, analysis_type, created_at)
- session_locks (id, project_id, user_id, locked_at, last_heartbeat)

**Files changed:**
- New: `backend/app/db/database.py` — async engine + session factory from DATABASE_URL
- New: `backend/app/db/orm_models.py` — SQLAlchemy declarative models
- Replace: `backend/app/db/projects.py` — in-memory → SQLAlchemy async queries
- New: `backend/alembic/` — migration config
- New: `backend/alembic/versions/001_initial.py` — initial migration
- Modify: `backend/requirements.txt` — add sqlalchemy, asyncpg, alembic; remove supabase
- Modify: `backend/main.py` — add startup/shutdown for DB connection pool

## Section 2: Pure Python FEM Solver

**Algorithm:** Direct Stiffness Method using NumPy/SciPy

1. Build element stiffness matrices (6×6 for 2D beam-column: axial + flexural)
2. Transform to global coordinates via rotation matrix
3. Assemble into global stiffness matrix K (sparse COO → CSR)
4. Partition: eliminate restrained DOFs
5. Solve Ku = F via scipy.sparse.linalg.spsolve
6. Back-calculate member forces from element stiffness × displacements

**Files changed:**
- New: `backend/app/solver/fem_solver.py` — stiffness assembly + solve
- New: `backend/app/solver/element_stiffness.py` — 2D beam element K matrix
- Modify: `backend/app/solver/runner.py` — swap OpenSeesPy → fem_solver
- Delete: `backend/app/solver/model_builder.py` — no longer needed
- Modify: `backend/requirements.txt` — add numpy, scipy; remove openseespy

**Verification:** Existing analytical tests (PL³/48EI) must still pass.

## Section 3: Deployment

**Dockerfile** simplified:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

No native libraries, no platform specification. Builds anywhere.

**Local dev:** `DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/structura`
**Production:** Same env var pointing to cloud PostgreSQL.
