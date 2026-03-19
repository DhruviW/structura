"""In-memory project database for development.

In production these functions would be replaced by Supabase calls.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

# In-memory stores
_projects: dict[str, dict] = {}
_members: dict[str, list[dict]] = {}  # project_id -> [{user_id, email, role}]
_snapshots: dict[str, list[dict]] = {}  # project_id -> [snapshot]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def create_project(user_id: str, name: str, description: str = "") -> dict:
    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "name": name,
        "description": description,
        "owner_id": user_id,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _projects[project_id] = project

    # Owner is automatically a member with 'owner' role
    _members[project_id] = [{"user_id": user_id, "email": "", "role": "owner"}]
    _snapshots[project_id] = []

    return {**project, "role": "owner"}


async def list_user_projects(user_id: str) -> list[dict]:
    result = []
    for project_id, project in _projects.items():
        members = _members.get(project_id, [])
        user_member = next((m for m in members if m["user_id"] == user_id), None)
        if user_member:
            result.append({**project, "role": user_member["role"]})
    return result


async def save_snapshot(
    project_id: str, user_id: str, model_json: dict, label: str = ""
) -> dict:
    snapshot = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "user_id": user_id,
        "model_json": model_json,
        "label": label,
        "created_at": _now(),
    }
    if project_id not in _snapshots:
        _snapshots[project_id] = []
    _snapshots[project_id].append(snapshot)

    # Update project updated_at
    if project_id in _projects:
        _projects[project_id]["updated_at"] = _now()

    return snapshot


async def get_latest_snapshot(project_id: str) -> dict | None:
    snaps = _snapshots.get(project_id, [])
    return snaps[-1] if snaps else None


async def list_snapshots(project_id: str) -> list[dict]:
    return list(_snapshots.get(project_id, []))


async def get_user_role(project_id: str, user_id: str) -> str | None:
    members = _members.get(project_id, [])
    member = next((m for m in members if m["user_id"] == user_id), None)
    return member["role"] if member else None


async def add_project_member(project_id: str, user_email: str, role: str) -> dict:
    if project_id not in _members:
        _members[project_id] = []

    # Use email as user_id placeholder until real auth maps email -> user_id
    entry = {"user_id": user_email, "email": user_email, "role": role}
    # Remove existing entry for this email if present, then re-add
    _members[project_id] = [m for m in _members[project_id] if m["email"] != user_email]
    _members[project_id].append(entry)
    return entry
