"""SQLAlchemy-backed project database functions."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.orm_models import Project, ProjectMember, ModelSnapshot


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def create_project(
    session: AsyncSession, user_id: str, name: str, description: str = ""
) -> dict:
    project = Project(
        id=str(uuid.uuid4()),
        name=name,
        description=description,
        owner_id=user_id,
        created_at=_now(),
        updated_at=_now(),
    )
    session.add(project)

    member = ProjectMember(
        id=str(uuid.uuid4()),
        project_id=project.id,
        user_id=user_id,
        role="owner",
        created_at=_now(),
    )
    session.add(member)
    await session.commit()
    await session.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "owner_id": project.owner_id,
        "created_at": project.created_at.isoformat(),
        "updated_at": project.updated_at.isoformat(),
        "role": "owner",
    }


async def list_user_projects(session: AsyncSession, user_id: str) -> list[dict]:
    stmt = (
        select(Project, ProjectMember.role)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(ProjectMember.user_id == user_id)
    )
    rows = await session.execute(stmt)
    result = []
    for project, role in rows:
        result.append(
            {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "owner_id": project.owner_id,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat(),
                "role": role,
            }
        )
    return result


async def save_snapshot(
    session: AsyncSession,
    project_id: str,
    user_id: str,
    model_json: dict,
    label: str = "",
) -> dict:
    snapshot = ModelSnapshot(
        id=str(uuid.uuid4()),
        project_id=project_id,
        label=label,
        model_json=model_json,
        created_by=user_id,
        created_at=_now(),
    )
    session.add(snapshot)

    # Update project updated_at
    project = await session.get(Project, project_id)
    if project:
        project.updated_at = _now()

    await session.commit()
    await session.refresh(snapshot)

    return {
        "id": snapshot.id,
        "project_id": snapshot.project_id,
        "label": snapshot.label,
        "model_json": snapshot.model_json,
        "created_by": snapshot.created_by,
        "created_at": snapshot.created_at.isoformat(),
    }


async def get_latest_snapshot(session: AsyncSession, project_id: str) -> dict | None:
    stmt = (
        select(ModelSnapshot)
        .where(ModelSnapshot.project_id == project_id)
        .order_by(ModelSnapshot.created_at.desc())
        .limit(1)
    )
    row = (await session.execute(stmt)).scalar_one_or_none()
    if row is None:
        return None
    return {
        "id": row.id,
        "project_id": row.project_id,
        "label": row.label,
        "model_json": row.model_json,
        "created_by": row.created_by,
        "created_at": row.created_at.isoformat(),
    }


async def list_snapshots(session: AsyncSession, project_id: str) -> list[dict]:
    stmt = (
        select(ModelSnapshot)
        .where(ModelSnapshot.project_id == project_id)
        .order_by(ModelSnapshot.created_at.desc())
    )
    rows = (await session.execute(stmt)).scalars().all()
    return [
        {
            "id": row.id,
            "project_id": row.project_id,
            "label": row.label,
            "model_json": row.model_json,
            "created_by": row.created_by,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]


async def get_user_role(
    session: AsyncSession, project_id: str, user_id: str
) -> str | None:
    stmt = select(ProjectMember.role).where(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
    )
    return (await session.execute(stmt)).scalar_one_or_none()


async def add_project_member(
    session: AsyncSession, project_id: str, user_id: str, role: str
) -> dict:
    # Upsert: remove existing entry for this user then insert
    stmt = select(ProjectMember).where(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
    )
    existing = (await session.execute(stmt)).scalar_one_or_none()
    if existing:
        existing.role = role
        await session.commit()
        await session.refresh(existing)
        member = existing
    else:
        member = ProjectMember(
            id=str(uuid.uuid4()),
            project_id=project_id,
            user_id=user_id,
            role=role,
            created_at=_now(),
        )
        session.add(member)
        await session.commit()
        await session.refresh(member)

    return {
        "id": member.id,
        "project_id": member.project_id,
        "user_id": member.user_id,
        "role": member.role,
        "created_at": member.created_at.isoformat(),
    }
