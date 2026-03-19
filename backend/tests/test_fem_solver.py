"""
Analytical verification tests for the 3D FEM solver (6 DOFs per node).
"""
import pytest
import numpy as np
from app.solver.fem_solver import solve_linear_static


# ─── Helper: default member properties ───────────────────────────────────────

def _default_member(id, i, j, E=200e9, A=0.01, Iz=1e-4, Iy=1e-4, G=77e9, J=1e-4):
    return {"id": id, "i": i, "j": j, "E": E, "A": A, "Iz": Iz, "Iy": Iy, "G": G, "J": J}


# ─── Helper: simply supported beam in XY plane ──────────────────────────────

def make_simply_supported_beam(P=100000.0, L=5.0, E=200e9, Iz=1e-4, A=0.01):
    """
    Simply supported beam with a point load at midspan (in XY plane).
    Three nodes (supports at 1 and 3, load at 2).
    Node 1: pin (Ux, Uy, Uz fixed), Node 3: roller (Uy fixed).
    """
    nodes = [
        {"id": 1, "x": 0.0, "y": 0.0, "z": 0.0},
        {"id": 2, "x": L / 2, "y": 0.0, "z": 0.0},
        {"id": 3, "x": L, "y": 0.0, "z": 0.0},
    ]
    members = [
        _default_member(1, 1, 2, E=E, A=A, Iz=Iz),
        _default_member(2, 2, 3, E=E, A=A, Iz=Iz),
    ]
    # Pin at node 1: fix translations + torsion + out-of-plane rotation
    # Roller at node 3: fix Uy only + Uz + Rx + Ry to keep it a 2D-like problem
    restraints = {
        1: [1, 1, 1, 1, 1, 0],
        2: [0, 0, 1, 1, 1, 0],
        3: [0, 1, 1, 1, 1, 0],
    }
    loads = [{"node": 2, "Fx": 0, "Fy": -P, "Fz": 0, "Mx": 0, "My": 0, "Mz": 0}]
    return nodes, members, restraints, loads


class TestFEMSolver2DBackwardsCompat:
    """Tests that 2D-like problems (z=0) give correct results with the 3D solver."""

    def test_midspan_deflection_matches_analytical(self):
        """delta_max = PL^3 / (48EI) for simply supported beam with central load."""
        P, L, E, Iz = 100000.0, 5.0, 200e9, 1e-4
        nodes, members, restraints, loads = make_simply_supported_beam(P, L, E, Iz)
        result = solve_linear_static(nodes, members, restraints, loads)

        expected_delta = P * L**3 / (48 * E * Iz)
        midspan = next(d for d in result["displacements"] if d["node"] == 2)
        assert midspan["uy"] == pytest.approx(-expected_delta, rel=0.01)

    def test_reactions_sum_to_applied_load(self):
        """Sum of vertical reactions must equal the applied load."""
        P = 100000.0
        nodes, members, restraints, loads = make_simply_supported_beam(P=P)
        result = solve_linear_static(nodes, members, restraints, loads)

        total_Fy = sum(r["Fy"] for r in result["reactions"])
        assert total_Fy == pytest.approx(P, rel=0.01)

    def test_max_moment_at_midspan(self):
        """M_max = PL/4 at midspan for simply supported beam."""
        P, L = 100000.0, 5.0
        nodes, members, restraints, loads = make_simply_supported_beam(P=P, L=L)
        result = solve_linear_static(nodes, members, restraints, loads)

        expected_M = P * L / 4
        m1 = next(f for f in result["member_forces"] if f["id"] == 1)
        assert abs(m1["Mz"][1]) == pytest.approx(expected_M, rel=0.05)

    def test_cantilever_tip_deflection_uy(self):
        """Cantilever beam: delta = PL^3 / (3EIz) for load in Y."""
        P, L, E, Iz, A = 50000.0, 3.0, 200e9, 1e-4, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0, "z": 0.0},
            {"id": 2, "x": L, "y": 0.0, "z": 0.0},
        ]
        members = [_default_member(1, 1, 2, E=E, A=A, Iz=Iz)]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": -P, "Fz": 0, "Mx": 0, "My": 0, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected = P * L**3 / (3 * E * Iz)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["uy"] == pytest.approx(-expected, rel=0.01)

    def test_cantilever_tip_rotation_rz(self):
        """Cantilever beam: theta = PL^2 / (2EIz) for load in Y."""
        P, L, E, Iz, A = 50000.0, 3.0, 200e9, 1e-4, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0, "z": 0.0},
            {"id": 2, "x": L, "y": 0.0, "z": 0.0},
        ]
        members = [_default_member(1, 1, 2, E=E, A=A, Iz=Iz)]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": -P, "Fz": 0, "Mx": 0, "My": 0, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected_theta = P * L**2 / (2 * E * Iz)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["rz"] == pytest.approx(-expected_theta, rel=0.01)

    def test_member_forces_have_two_end_values(self):
        """Each member force result must have exactly 2 values [i-end, j-end]."""
        nodes, members, restraints, loads = make_simply_supported_beam()
        result = solve_linear_static(nodes, members, restraints, loads)

        for mf in result["member_forces"]:
            assert len(mf["N"]) == 2
            assert len(mf["Vy"]) == 2
            assert len(mf["Vz"]) == 2
            assert len(mf["T"]) == 2
            assert len(mf["My"]) == 2
            assert len(mf["Mz"]) == 2

    def test_axial_only_truss_element(self):
        """A horizontal bar under axial load: delta = PL / (EA)"""
        P, L, E, A = 100000.0, 2.0, 200e9, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0, "z": 0.0},
            {"id": 2, "x": L, "y": 0.0, "z": 0.0},
        ]
        members = [_default_member(1, 1, 2, E=E, A=A)]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 1, 1, 1, 1, 1]}
        loads = [{"node": 2, "Fx": P, "Fy": 0, "Fz": 0, "Mx": 0, "My": 0, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected = P * L / (E * A)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["ux"] == pytest.approx(expected, rel=0.01)

    def test_empty_loads_returns_zero_displacements(self):
        """No loads applied: all displacements should be zero."""
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0, "z": 0.0},
            {"id": 2, "x": 3.0, "y": 0.0, "z": 0.0},
        ]
        members = [_default_member(1, 1, 2)]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = []

        result = solve_linear_static(nodes, members, restraints, loads)

        for d in result["displacements"]:
            assert d["ux"] == pytest.approx(0.0, abs=1e-12)
            assert d["uy"] == pytest.approx(0.0, abs=1e-12)
            assert d["uz"] == pytest.approx(0.0, abs=1e-12)
            assert d["rx"] == pytest.approx(0.0, abs=1e-12)
            assert d["ry"] == pytest.approx(0.0, abs=1e-12)
            assert d["rz"] == pytest.approx(0.0, abs=1e-12)


class TestFEMSolver3D:
    """Tests for true 3D behavior: out-of-plane bending, torsion, 3D geometry."""

    def test_3d_cantilever_uz(self):
        """Tip load Fz on cantilever -> Uz = PL^3 / (3*E*Iy)"""
        P, L, E, Iy = 50000, 3.0, 200e9, 2e-4
        nodes = [
            {"id": 1, "x": 0, "y": 0, "z": 0},
            {"id": 2, "x": L, "y": 0, "z": 0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": 0.01, "Iz": 1e-4, "Iy": Iy, "G": 77e9, "J": 1e-4}]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": 0, "Fz": -P, "Mx": 0, "My": 0, "Mz": 0}]
        result = solve_linear_static(nodes, members, restraints, loads)
        expected = P * L**3 / (3 * E * Iy)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["uz"] == pytest.approx(-expected, rel=0.01)

    def test_3d_cantilever_uz_rotation_ry(self):
        """Tip load Fz on cantilever -> ry = PL^2 / (2*E*Iy)"""
        P, L, E, Iy = 50000, 3.0, 200e9, 2e-4
        nodes = [
            {"id": 1, "x": 0, "y": 0, "z": 0},
            {"id": 2, "x": L, "y": 0, "z": 0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": 0.01, "Iz": 1e-4, "Iy": Iy, "G": 77e9, "J": 1e-4}]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": 0, "Fz": -P, "Mx": 0, "My": 0, "Mz": 0}]
        result = solve_linear_static(nodes, members, restraints, loads)
        expected_theta = P * L**2 / (2 * E * Iy)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        # For Fz load, rotation is about y-axis; sign: positive ry for negative Fz
        assert tip["ry"] == pytest.approx(expected_theta, rel=0.01)

    def test_torsion(self):
        """Pure torsion: twist = TL / (GJ)"""
        T_val, L, G, J = 1000, 2.0, 77e9, 1e-4
        nodes = [
            {"id": 1, "x": 0, "y": 0, "z": 0},
            {"id": 2, "x": L, "y": 0, "z": 0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": 200e9, "A": 0.01, "Iz": 1e-4, "Iy": 1e-4, "G": G, "J": J}]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": 0, "Fz": 0, "Mx": T_val, "My": 0, "Mz": 0}]
        result = solve_linear_static(nodes, members, restraints, loads)
        expected_twist = T_val * L / (G * J)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["rx"] == pytest.approx(expected_twist, rel=0.01)

    def test_3d_equilibrium(self):
        """Sum of reactions = sum of applied loads in all 6 components."""
        # 3D L-shaped frame
        nodes = [
            {"id": 1, "x": 0, "y": 0, "z": 0},
            {"id": 2, "x": 3, "y": 0, "z": 0},
            {"id": 3, "x": 3, "y": 0, "z": 2},
        ]
        members = [
            {"id": 1, "i": 1, "j": 2, "E": 200e9, "A": 0.01, "Iz": 1e-4, "Iy": 1e-4, "G": 77e9, "J": 1e-4},
            {"id": 2, "i": 2, "j": 3, "E": 200e9, "A": 0.01, "Iz": 1e-4, "Iy": 1e-4, "G": 77e9, "J": 1e-4},
        ]
        restraints = {
            1: [1, 1, 1, 1, 1, 1],
            2: [0, 0, 0, 0, 0, 0],
            3: [0, 0, 0, 0, 0, 0],
        }
        # Apply loads in multiple directions at node 3
        loads = [{"node": 3, "Fx": 1000, "Fy": -2000, "Fz": 500, "Mx": 100, "My": -50, "Mz": 200}]

        result = solve_linear_static(nodes, members, restraints, loads)

        # Sum of reactions + applied loads should equal zero (equilibrium)
        total_Fx = sum(r["Fx"] for r in result["reactions"]) + 1000
        total_Fy = sum(r["Fy"] for r in result["reactions"]) + (-2000)
        total_Fz = sum(r["Fz"] for r in result["reactions"]) + 500

        assert total_Fx == pytest.approx(0.0, abs=1e-3)
        assert total_Fy == pytest.approx(0.0, abs=1e-3)
        assert total_Fz == pytest.approx(0.0, abs=1e-3)

    def test_vertical_member_cantilever(self):
        """Vertical cantilever (along Y-axis) with lateral load at top."""
        P, L, E, Iz = 10000, 4.0, 200e9, 1e-4
        nodes = [
            {"id": 1, "x": 0, "y": 0, "z": 0},
            {"id": 2, "x": 0, "y": L, "z": 0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": 0.01, "Iz": Iz, "Iy": Iz, "G": 77e9, "J": 1e-4}]
        restraints = {1: [1, 1, 1, 1, 1, 1], 2: [0, 0, 0, 0, 0, 0]}
        # Load in X direction (lateral to vertical member)
        loads = [{"node": 2, "Fx": P, "Fy": 0, "Fz": 0, "Mx": 0, "My": 0, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        # For a vertical member with lateral load, deflection = PL^3/(3EI)
        expected = P * L**3 / (3 * E * Iz)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["ux"] == pytest.approx(expected, rel=0.01)

    def test_displacements_have_6_components(self):
        """Each displacement result has all 6 DOF components."""
        nodes, members, restraints, loads = make_simply_supported_beam()
        result = solve_linear_static(nodes, members, restraints, loads)
        for d in result["displacements"]:
            for key in ["ux", "uy", "uz", "rx", "ry", "rz"]:
                assert key in d

    def test_reactions_have_6_components(self):
        """Each reaction result has all 6 force/moment components."""
        nodes, members, restraints, loads = make_simply_supported_beam()
        result = solve_linear_static(nodes, members, restraints, loads)
        for r in result["reactions"]:
            for key in ["Fx", "Fy", "Fz", "Mx", "My", "Mz"]:
                assert key in r

    def test_stiffness_matrix_symmetry(self):
        """The 12x12 local stiffness matrix should be symmetric."""
        from app.solver.element_stiffness import beam_element_stiffness_local_3d
        k = beam_element_stiffness_local_3d(200e9, 0.01, 1e-4, 2e-4, 77e9, 1e-4, 3.0)
        np.testing.assert_allclose(k, k.T, atol=1e-6)

    def test_rotation_matrix_orthogonality(self):
        """The rotation matrix T should be orthogonal: T^T @ T = I."""
        from app.solver.element_stiffness import rotation_matrix_3d
        T = rotation_matrix_3d(0, 0, 0, 3, 4, 5)
        identity = T.T @ T
        np.testing.assert_allclose(identity, np.eye(12), atol=1e-10)

    def test_rotation_matrix_vertical_member(self):
        """Rotation matrix for vertical member should be orthogonal."""
        from app.solver.element_stiffness import rotation_matrix_3d
        T = rotation_matrix_3d(0, 0, 0, 0, 5, 0)
        identity = T.T @ T
        np.testing.assert_allclose(identity, np.eye(12), atol=1e-10)
