"""
OpenSeesPy model builder.
Translates a StructuralModel Pydantic object into an OpenSeesPy in-memory model.
"""
from __future__ import annotations

import openseespy.opensees as ops

from app.models.structural import StructuralModel, PointLoad


def build_opensees_model(model: StructuralModel) -> None:
    """Wipe any existing OpenSeesPy state and build a fresh model."""
    ops.wipe()
    ops.model('basic', '-ndm', 2, '-ndf', 3)

    # ── Nodes ─────────────────────────────────────────────────────────────────
    for node in model.nodes:
        ops.node(node.id, node.x, node.y)

    # ── Boundary conditions ───────────────────────────────────────────────────
    for node in model.nodes:
        ops.fix(node.id, *node.restraints)

    # ── Materials (uniaxial elastic, one per material) ────────────────────────
    # Map material string-id -> integer tag for OpenSeesPy
    mat_tag: dict[str, int] = {}
    for idx, material in enumerate(model.materials, start=1):
        mat_tag[material.id] = idx
        ops.uniaxialMaterial('Elastic', idx, material.E)

    # ── Sections lookup ───────────────────────────────────────────────────────
    section_map = {s.id: s for s in model.sections}

    # ── Geometric transformation (single linear transform, tag=1) ─────────────
    ops.geomTransf('Linear', 1)

    # ── Members as elasticBeamColumn elements ─────────────────────────────────
    # Retrieve material E for each member (needed for elasticBeamColumn)
    mat_E: dict[str, float] = {m.id: m.E for m in model.materials}

    for member in model.members:
        # Section properties
        sec = section_map.get(member.section)
        A = sec.A if sec else 0.01
        Iz = sec.Iz if sec else 1e-4
        E = mat_E.get(member.material, 200e9)

        ops.element(
            'elasticBeamColumn',
            member.id,
            member.i,
            member.j,
            A,
            E,
            Iz,
            1,  # geomTransf tag
        )

    # ── Loads ─────────────────────────────────────────────────────────────────
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)

    for load in model.loads:
        if isinstance(load, PointLoad):
            ops.load(load.node, load.Fx, load.Fy, load.Mz)
