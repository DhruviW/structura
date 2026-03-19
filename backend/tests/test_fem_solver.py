"""
Analytical verification tests for the pure-Python FEM solver.
"""
import pytest
from app.solver.fem_solver import solve_linear_static


def make_simply_supported_beam(P=100000.0, L=5.0, E=200e9, I=1e-4, A=0.01):
    """
    Simply supported beam with a point load at midspan.
    Three nodes (supports at 1 and 3, load at 2).
    Node 1: pin (ux, uy fixed), Node 3: roller (uy fixed).
    """
    nodes = [
        {"id": 1, "x": 0.0, "y": 0.0},
        {"id": 2, "x": L / 2, "y": 0.0},
        {"id": 3, "x": L, "y": 0.0},
    ]
    members = [
        {"id": 1, "i": 1, "j": 2, "E": E, "A": A, "I": I},
        {"id": 2, "i": 2, "j": 3, "E": E, "A": A, "I": I},
    ]
    restraints = {1: [1, 1, 0], 2: [0, 0, 0], 3: [0, 1, 0]}
    loads = [{"node": 2, "Fx": 0, "Fy": -P, "Mz": 0}]
    return nodes, members, restraints, loads


class TestFEMSolver:
    def test_midspan_deflection_matches_analytical(self):
        """delta_max = PL^3 / (48EI) for simply supported beam with central load."""
        P, L, E, I = 100000.0, 5.0, 200e9, 1e-4
        nodes, members, restraints, loads = make_simply_supported_beam(P, L, E, I)
        result = solve_linear_static(nodes, members, restraints, loads)

        expected_delta = P * L**3 / (48 * E * I)
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
        # The moment at the j-end of member 1 (which is node 2 = midspan)
        m1 = next(f for f in result["member_forces"] if f["id"] == 1)
        assert abs(m1["M"][1]) == pytest.approx(expected_M, rel=0.05)

    def test_cantilever_tip_deflection(self):
        """Cantilever beam: delta = PL^3 / (3EI)"""
        P, L, E, I, A = 50000.0, 3.0, 200e9, 1e-4, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0},
            {"id": 2, "x": L, "y": 0.0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": A, "I": I}]
        restraints = {1: [1, 1, 1], 2: [0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": -P, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected = P * L**3 / (3 * E * I)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["uy"] == pytest.approx(-expected, rel=0.01)

    def test_cantilever_tip_rotation(self):
        """Cantilever beam: theta = PL^2 / (2EI)"""
        P, L, E, I, A = 50000.0, 3.0, 200e9, 1e-4, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0},
            {"id": 2, "x": L, "y": 0.0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": A, "I": I}]
        restraints = {1: [1, 1, 1], 2: [0, 0, 0]}
        loads = [{"node": 2, "Fx": 0, "Fy": -P, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected_theta = P * L**2 / (2 * E * I)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["rz"] == pytest.approx(-expected_theta, rel=0.01)

    def test_member_forces_have_two_end_values(self):
        """Each member force result must have exactly 2 values [i-end, j-end]."""
        nodes, members, restraints, loads = make_simply_supported_beam()
        result = solve_linear_static(nodes, members, restraints, loads)

        for mf in result["member_forces"]:
            assert len(mf["N"]) == 2
            assert len(mf["V"]) == 2
            assert len(mf["M"]) == 2

    def test_axial_only_truss_element(self):
        """A horizontal bar under axial load: delta = PL / (EA)"""
        P, L, E, A = 100000.0, 2.0, 200e9, 0.01
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0},
            {"id": 2, "x": L, "y": 0.0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": E, "A": A, "I": 1e-4}]
        restraints = {1: [1, 1, 1], 2: [0, 1, 1]}
        loads = [{"node": 2, "Fx": P, "Fy": 0, "Mz": 0}]

        result = solve_linear_static(nodes, members, restraints, loads)

        expected = P * L / (E * A)
        tip = next(d for d in result["displacements"] if d["node"] == 2)
        assert tip["ux"] == pytest.approx(expected, rel=0.01)

    def test_empty_loads_returns_zero_displacements(self):
        """No loads applied: all displacements should be zero."""
        nodes = [
            {"id": 1, "x": 0.0, "y": 0.0},
            {"id": 2, "x": 3.0, "y": 0.0},
        ]
        members = [{"id": 1, "i": 1, "j": 2, "E": 200e9, "A": 0.01, "I": 1e-4}]
        restraints = {1: [1, 1, 1], 2: [0, 0, 0]}
        loads = []

        result = solve_linear_static(nodes, members, restraints, loads)

        for d in result["displacements"]:
            assert d["ux"] == pytest.approx(0.0, abs=1e-12)
            assert d["uy"] == pytest.approx(0.0, abs=1e-12)
            assert d["rz"] == pytest.approx(0.0, abs=1e-12)
