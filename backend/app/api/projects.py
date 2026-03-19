from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.middleware.auth import get_current_user
from app.db import projects as db
from app.db.database import get_session

router = APIRouter(prefix="/projects", tags=["projects"])


# ── Request schemas ───────────────────────────────────────────────────────────

class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""


class SaveSnapshotRequest(BaseModel):
    model_json: dict
    label: str = ""


class AddMemberRequest(BaseModel):
    email: str
    role: str = "editor"  # "owner" | "editor" | "viewer"


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _require_role(
    session: AsyncSession, project_id: str, user_id: str, allowed_roles: list[str]
) -> str:
    role = await db.get_user_role(session, project_id, user_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return role


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def create_project(
    body: CreateProjectRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await db.create_project(session, user["id"], body.name, body.description)


@router.get("/")
async def list_projects(
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await db.list_user_projects(session, user["id"])


@router.post("/{project_id}/snapshots", status_code=201)
async def save_snapshot(
    project_id: str,
    body: SaveSnapshotRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await _require_role(session, project_id, user["id"], ["owner", "editor"])
    return await db.save_snapshot(session, project_id, user["id"], body.model_json, body.label)


@router.get("/{project_id}/snapshots")
async def list_snapshots(
    project_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await _require_role(session, project_id, user["id"], ["owner", "editor", "viewer"])
    return await db.list_snapshots(session, project_id)


@router.get("/{project_id}/snapshots/latest")
async def get_latest_snapshot(
    project_id: str,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await _require_role(session, project_id, user["id"], ["owner", "editor", "viewer"])
    snap = await db.get_latest_snapshot(session, project_id)
    if snap is None:
        raise HTTPException(status_code=404, detail="No snapshots yet")
    return snap


@router.post("/{project_id}/members", status_code=201)
async def add_member(
    project_id: str,
    body: AddMemberRequest,
    user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await _require_role(session, project_id, user["id"], ["owner"])
    return await db.add_project_member(session, project_id, body.email, body.role)
