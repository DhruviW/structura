import pytest
from app.models.structural import StructuralModel, Node, Member, Material, Section, PointLoad
from app.solver.runner import run_linear_static

def make_simply_supported_beam(P=100000.0, L=5.0, E=200e9, Iz=1e-4, A=0.01):
    """Analytical: midspan deflection = PL^3 / 48EIz, max moment = PL/4"""
    return StructuralModel(
        nodes=[
            Node(id=1, x=0.0, y=0.0, z=0.0, restraints=[1, 1, 1, 1, 1, 0]),
            Node(id=2, x=L/2, y=0.0, z=0.0, restraints=[0, 0, 1, 1, 1, 0]),
            Node(id=3, x=L, y=0.0, z=0.0, restraints=[0, 1, 1, 1, 1, 0]),
        ],
        members=[
            Member(id=1, i=1, j=2, section="s1", material="steel"),
            Member(id=2, i=2, j=3, section="s1", material="steel"),
        ],
        plates=[],
        materials=[Material(id="steel", name="Steel", E=E, G=77e9, nu=0.3, rho=7850, fy=250e6)],
        sections=[Section(id="s1", name="Beam", A=A, Iz=Iz, Iy=Iz, J=1e-4, Sz=1e-3, Sy=1e-3)],
        loads=[PointLoad(id=1, type="point", node=2, Fx=0, Fy=-P, Fz=0, Mx=0, My=0, Mz=0)],
    )

class TestLinearStaticSolver:
    def test_midspan_deflection_matches_analytical(self):
        P, L, E, Iz = 100000.0, 5.0, 200e9, 1e-4
        model = make_simply_supported_beam(P, L, E, Iz)
        results = run_linear_static(model)
        expected_delta = P * L**3 / (48 * E * Iz)
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
            assert len(mf.Vy) == 2
            assert len(mf.Vz) == 2
            assert len(mf.T) == 2
            assert len(mf.My) == 2
            assert len(mf.Mz) == 2

    def test_max_moment_at_midspan(self):
        P, L = 100000.0, 5.0
        results = run_linear_static(make_simply_supported_beam(P=P, L=L))
        expected_M = P * L / 4
        m1 = next(mf for mf in results.member_forces if mf.id == 1)
        assert abs(m1.Mz[1]) == pytest.approx(expected_M, rel=0.05)

    def test_node_displacement_has_6_components(self):
        results = run_linear_static(make_simply_supported_beam())
        for d in results.displacements:
            assert hasattr(d, 'ux')
            assert hasattr(d, 'uy')
            assert hasattr(d, 'uz')
            assert hasattr(d, 'rx')
            assert hasattr(d, 'ry')
            assert hasattr(d, 'rz')

    def test_reaction_has_6_components(self):
        results = run_linear_static(make_simply_supported_beam())
        for r in results.reactions:
            assert hasattr(r, 'Fx')
            assert hasattr(r, 'Fy')
            assert hasattr(r, 'Fz')
            assert hasattr(r, 'Mx')
            assert hasattr(r, 'My')
            assert hasattr(r, 'Mz')
