import pytest
from app.models.structural import StructuralModel, Node, Member, Material, Section, PointLoad
from app.solver.runner import run_linear_static

def make_simply_supported_beam(P=100000.0, L=5.0, E=200e9, I=1e-4, A=0.01):
    """Analytical: midspan deflection = PL³ / 48EI, max moment = PL/4"""
    return StructuralModel(
        nodes=[
            Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 0]),
            Node(id=2, x=L/2, y=0.0, restraints=[0, 0, 0]),
            Node(id=3, x=L, y=0.0, restraints=[0, 1, 0]),
        ],
        members=[
            Member(id=1, i=1, j=2, section="s1", material="steel"),
            Member(id=2, i=2, j=3, section="s1", material="steel"),
        ],
        plates=[],
        materials=[Material(id="steel", name="Steel", E=E, G=77e9, nu=0.3, rho=7850, fy=250e6)],
        sections=[Section(id="s1", name="Beam", A=A, Iz=I, Iy=I, J=1e-4, Sz=1e-3, Sy=1e-3)],
        loads=[PointLoad(id=1, type="point", node=2, Fx=0, Fy=-P, Mz=0)],
    )

class TestLinearStaticSolver:
    def test_midspan_deflection_matches_analytical(self):
        P, L, E, I = 100000.0, 5.0, 200e9, 1e-4
        model = make_simply_supported_beam(P, L, E, I)
        results = run_linear_static(model)
        expected_delta = P * L**3 / (48 * E * I)
        midspan_disp = next(d for d in results.displacements if d.node == 2)
        assert midspan_disp.uy == pytest.approx(-expected_delta, rel=0.01)

    def test_reactions_sum_to_applied_load(self):
        P = 100000.0
        results = run_linear_static(make_simply_supported_beam(P=P))
        total_Fy = sum(r.Fy for r in results.reactions)
        assert total_Fy == pytest.approx(P, rel=0.01)

    def test_member_forces_have_two_end_values(self):
        results = run_linear_static(make_simply_supported_beam())
        for mf in results.member_forces:
            assert len(mf.N) == 2
            assert len(mf.V) == 2
            assert len(mf.M) == 2

    def test_max_moment_at_midspan(self):
        P, L = 100000.0, 5.0
        results = run_linear_static(make_simply_supported_beam(P=P, L=L))
        expected_M = P * L / 4
        m1 = next(mf for mf in results.member_forces if mf.id == 1)
        assert abs(m1.M[1]) == pytest.approx(expected_M, rel=0.05)
