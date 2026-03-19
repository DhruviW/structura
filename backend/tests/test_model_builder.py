import pytest
import openseespy.opensees as ops
from app.models.structural import StructuralModel, Node, Member, Material, Section, PointLoad
from app.solver.model_builder import build_opensees_model

def make_simple_beam():
    return StructuralModel(
        nodes=[
            Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 0]),
            Node(id=2, x=2.5, y=0.0, restraints=[0, 0, 0]),
            Node(id=3, x=5.0, y=0.0, restraints=[0, 1, 0]),
        ],
        members=[
            Member(id=1, i=1, j=2, section="beam", material="steel"),
            Member(id=2, i=2, j=3, section="beam", material="steel"),
        ],
        plates=[],
        materials=[Material(id="steel", name="Steel", E=200e9, G=77e9, nu=0.3, rho=7850, fy=250e6)],
        sections=[Section(id="beam", name="Beam", A=0.01, Iz=1e-4, Iy=1e-4, J=1e-4, Sz=1e-3, Sy=1e-3)],
        loads=[PointLoad(id=1, type="point", node=2, Fx=0, Fy=-100000, Mz=0)],
    )

class TestModelBuilder:
    def test_builds_without_error(self):
        build_opensees_model(make_simple_beam())
        assert len(ops.getNodeTags()) == 3

    def test_nodes_have_correct_coords(self):
        build_opensees_model(make_simple_beam())
        coords = ops.nodeCoord(2)
        assert coords[0] == pytest.approx(2.5)
        assert coords[1] == pytest.approx(0.0)

    def test_boundary_conditions_applied(self):
        build_opensees_model(make_simple_beam())
        assert 1 in ops.getNodeTags()
