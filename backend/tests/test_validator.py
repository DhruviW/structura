import pytest
from app.models.structural import StructuralModel, Node, Member, Material, PointLoad
from app.solver.validator import validate_model

def make_simple_beam():
    return StructuralModel(
        nodes=[
            Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 0, 0, 0, 0]),
            Node(id=2, x=5.0, y=0.0, restraints=[0, 1, 0, 0, 0, 0]),
        ],
        members=[Member(id=1, i=1, j=2, section="W10x49", material="A36")],
        plates=[],
        materials=[Material(id="A36", name="Steel A36", E=200e9, G=77e9, nu=0.3, rho=7850, fy=250e6)],
        sections=[],
        loads=[PointLoad(id=1, type="point", node=2, Fx=0, Fy=-50000, Mz=0)],
    )

class TestValidator:
    def test_valid_model_passes(self):
        errors = validate_model(make_simple_beam())
        assert errors == []

    def test_member_references_missing_node(self):
        model = make_simple_beam()
        model.members[0].j = 99
        errors = validate_model(model)
        assert any("node 99" in e.lower() for e in errors)

    def test_member_references_missing_material(self):
        model = make_simple_beam()
        model.members[0].material = "NonExistent"
        errors = validate_model(model)
        assert any("material" in e.lower() for e in errors)

    def test_load_references_missing_node(self):
        model = make_simple_beam()
        model.loads[0].node = 99
        errors = validate_model(model)
        assert any("node 99" in e.lower() for e in errors)

    def test_model_has_no_supports(self):
        model = make_simple_beam()
        for node in model.nodes:
            node.restraints = [0, 0, 0, 0, 0, 0]
        errors = validate_model(model)
        assert any("support" in e.lower() or "restraint" in e.lower() for e in errors)

    def test_model_has_no_loads(self):
        model = make_simple_beam()
        model.loads = []
        errors = validate_model(model)
        assert any("load" in e.lower() for e in errors)
