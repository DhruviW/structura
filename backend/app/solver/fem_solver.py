"""
Linear static FEM solver using the Direct Stiffness Method.
Pure Python implementation using NumPy and SciPy -- no native dependencies.
"""
from __future__ import annotations

import math
from typing import Dict, List

import numpy as np
from scipy.sparse import lil_matrix
from scipy.sparse.linalg import spsolve

from app.solver.element_stiffness import (
    beam_element_stiffness_global,
    beam_element_stiffness_local,
    rotation_matrix_2d,
)


def solve_linear_static(
    nodes: List[dict],
    members: List[dict],
    restraints: Dict,
    loads: List[dict],
) -> dict:
    """
    Solve a 2D frame by the Direct Stiffness Method.

    Parameters
    ----------
    nodes    : [{"id": int, "x": float, "y": float}, ...]
    members  : [{"id": int, "i": int, "j": int, "E": float, "A": float, "I": float}, ...]
    restraints : {node_id: [rx, ry, rz]}  where 1=fixed, 0=free
    loads    : [{"node": int, "Fx": float, "Fy": float, "Mz": float}, ...]

    Returns
    -------
    dict with keys: displacements, member_forces, reactions
    """
    # ── 1. Build DOF map: node_id -> [dof_x, dof_y, dof_rz] ────────────────
    node_map = {n["id"]: n for n in nodes}
    sorted_node_ids = sorted(node_map.keys())
    dof_map: Dict[int, List[int]] = {}
    ndof = 0
    for nid in sorted_node_ids:
        dof_map[nid] = [ndof, ndof + 1, ndof + 2]
        ndof += 3

    # ── 2. Assemble global stiffness matrix (sparse) ────────────────────────
    K = lil_matrix((ndof, ndof))

    # Pre-compute element info for later member-force extraction
    elem_info = []  # (member, L, cos, sin, dofs_i, dofs_j)

    for mem in members:
        ni = node_map[mem["i"]]
        nj = node_map[mem["j"]]
        dx = nj["x"] - ni["x"]
        dy = nj["y"] - ni["y"]
        L = math.sqrt(dx * dx + dy * dy)
        if L == 0:
            raise ValueError(
                f"Member {mem['id']} has zero length (nodes {mem['i']} and {mem['j']} coincide)"
            )
        cos_a = dx / L
        sin_a = dy / L

        E, A, I = mem["E"], mem["A"], mem["I"]

        k_global = beam_element_stiffness_global(E, A, I, L, cos_a, sin_a)

        dofs_i = dof_map[mem["i"]]
        dofs_j = dof_map[mem["j"]]
        elem_dofs = dofs_i + dofs_j  # list of 6 DOF indices

        # Scatter into global K
        for a in range(6):
            for b in range(6):
                K[elem_dofs[a], elem_dofs[b]] += k_global[a, b]

        elem_info.append((mem, L, cos_a, sin_a, dofs_i, dofs_j))

    # ── 3. Build force vector ───────────────────────────────────────────────
    F = np.zeros(ndof)
    for load in loads:
        nid = load["node"]
        dofs = dof_map[nid]
        F[dofs[0]] += load.get("Fx", 0.0)
        F[dofs[1]] += load.get("Fy", 0.0)
        F[dofs[2]] += load.get("Mz", 0.0)

    # ── 4. Partition DOFs into free and fixed ───────────────────────────────
    free_dofs = []
    fixed_dofs = []
    for nid in sorted_node_ids:
        r = restraints.get(nid, [0, 0, 0])
        for local_idx in range(3):
            dof = dof_map[nid][local_idx]
            if r[local_idx] == 1:
                fixed_dofs.append(dof)
            else:
                free_dofs.append(dof)

    free_dofs = np.array(free_dofs, dtype=int)
    fixed_dofs = np.array(fixed_dofs, dtype=int)

    # ── 5. Solve: Kff * u_free = Ff ─────────────────────────────────────────
    K_csc = K.tocsc()
    Kff = K_csc[np.ix_(free_dofs, free_dofs)]
    Ff = F[free_dofs]

    u = np.zeros(ndof)
    if len(free_dofs) > 0:
        u_free = spsolve(Kff, Ff)
        u[free_dofs] = u_free

    # ── 6. Compute reactions: R = K @ u - F ─────────────────────────────────
    R = K_csc.dot(u) - F

    # ── 7. Build displacement results ───────────────────────────────────────
    displacements = []
    for nid in sorted_node_ids:
        dofs = dof_map[nid]
        displacements.append({
            "node": nid,
            "ux": float(u[dofs[0]]),
            "uy": float(u[dofs[1]]),
            "rz": float(u[dofs[2]]),
        })

    # ── 8. Build reaction results (supported nodes only) ────────────────────
    reactions = []
    for nid in sorted_node_ids:
        r = restraints.get(nid, [0, 0, 0])
        if any(r):
            dofs = dof_map[nid]
            reactions.append({
                "node": nid,
                "Fx": float(R[dofs[0]]),
                "Fy": float(R[dofs[1]]),
                "Mz": float(R[dofs[2]]),
            })

    # ── 9. Compute member end forces in local coordinates ───────────────────
    member_forces = []
    for mem, L, cos_a, sin_a, dofs_i, dofs_j in elem_info:
        E, A, I = mem["E"], mem["A"], mem["I"]

        # Element global displacements
        elem_dofs = dofs_i + dofs_j
        u_elem = np.array([u[d] for d in elem_dofs])

        # Transform to local coordinates
        T = rotation_matrix_2d(cos_a, sin_a)
        u_local = T @ u_elem

        # Local stiffness
        k_local = beam_element_stiffness_local(E, A, I, L)

        # Local end forces
        f_local = k_local @ u_local

        # f_local = [Ni, Vi, Mi, Nj, Vj, Mj]
        member_forces.append({
            "id": mem["id"],
            "N": [float(f_local[0]), float(f_local[3])],
            "V": [float(f_local[1]), float(f_local[4])],
            "M": [float(f_local[2]), float(f_local[5])],
        })

    return {
        "displacements": displacements,
        "member_forces": member_forces,
        "reactions": reactions,
    }
