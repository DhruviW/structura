"""
Linear static analysis runner.
Prepares inputs from the Pydantic model and delegates to the 3D FEM solver (6 DOFs/node).
"""
from __future__ import annotations

from app.models.structural import StructuralModel
from app.models.results import (
    AnalysisResults,
    MemberForces,
    NodeDisplacement,
    Reaction,
)
from app.solver.fem_solver import solve_linear_static


def run_linear_static(model: StructuralModel) -> AnalysisResults:
    """Run a linear static analysis and return structured results."""

    # ── Prepare node list (now with z coordinate) ────────────────────────────
    nodes = [{"id": n.id, "x": n.x, "y": n.y, "z": n.z} for n in model.nodes]

    # ── Prepare member list (resolve section & material properties) ──────────
    section_map = {s.id: s for s in model.sections}
    mat_map = {m.id: m for m in model.materials}

    members = []
    for m in model.members:
        sec = section_map.get(m.section)
        mat = mat_map.get(m.material)
        members.append({
            "id": m.id,
            "i": m.i,
            "j": m.j,
            "E": mat.E if mat else 200e9,
            "A": sec.A if sec else 0.01,
            "Iz": sec.Iz if sec else 1e-4,
            "Iy": sec.Iy if sec else 1e-4,
            "G": mat.G if mat else 77e9,
            "J": sec.J if sec else 1e-4,
        })

    # ── Restraints: full 6-DOF ───────────────────────────────────────────────
    restraints = {n.id: n.restraints for n in model.nodes}

    # ── Point loads (full 6 components) ──────────────────────────────────────
    point_loads = []
    for load in model.loads:
        if load.type == "point":
            point_loads.append({
                "node": load.node,
                "Fx": load.Fx,
                "Fy": load.Fy,
                "Fz": load.Fz,
                "Mx": load.Mx,
                "My": load.My,
                "Mz": load.Mz,
            })

    # ── Solve ────────────────────────────────────────────────────────────────
    result = solve_linear_static(nodes, members, restraints, point_loads)

    # ── Map results directly (solver now returns full 6-DOF results) ─────────
    displacements = []
    for d in result["displacements"]:
        displacements.append(NodeDisplacement(
            node=d["node"],
            ux=d["ux"],
            uy=d["uy"],
            uz=d["uz"],
            rx=d["rx"],
            ry=d["ry"],
            rz=d["rz"],
        ))

    member_forces = []
    for f in result["member_forces"]:
        member_forces.append(MemberForces(
            id=f["id"],
            N=f["N"],
            Vy=f["Vy"],
            Vz=f["Vz"],
            T=f["T"],
            My=f["My"],
            Mz=f["Mz"],
        ))

    reactions = []
    for r in result["reactions"]:
        reactions.append(Reaction(
            node=r["node"],
            Fx=r["Fx"],
            Fy=r["Fy"],
            Fz=r["Fz"],
            Mx=r["Mx"],
            My=r["My"],
            Mz=r["Mz"],
        ))

    return AnalysisResults(
        displacements=displacements,
        member_forces=member_forces,
        reactions=reactions,
        plate_stresses=[],
    )
