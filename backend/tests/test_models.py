"""
Tests for Pydantic structural and results models.
"""
import pytest
from pydantic import ValidationError

from app.models.structural import (
    Node,
    Member,
    Plate,
    Material,
    Section,
    PointLoad,
    DistributedLoad,
    MomentLoad,
    StructuralModel,
)
from app.models.results import (
    NodeDisplacement,
    MemberForces,
    Reaction,
    PlateStress,
    AnalysisResults,
)


# ─── Node ─────────────────────────────────────────────────────────────────────

class TestNodeModel:
    def test_valid_node(self):
        node = Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 1])
        assert node.id == 1
        assert node.restraints == [1, 1, 1]

    def test_rejects_invalid_restraint_length(self):
        with pytest.raises(ValidationError):
            Node(id=1, x=0.0, y=0.0, restraints=[1, 1])

    def test_rejects_restraint_out_of_range(self):
        with pytest.raises(ValidationError):
            Node(id=1, x=0.0, y=0.0, restraints=[1, 2, 0])


# ─── Member ───────────────────────────────────────────────────────────────────

class TestMemberModel:
    def test_valid_member(self):
        member = Member(id=1, i=1, j=2, section='W10x49', material='A36')
        assert member.id == 1
        assert member.i == 1
        assert member.j == 2

    def test_rejects_same_start_end_nodes(self):
        with pytest.raises(ValidationError):
            Member(id=1, i=1, j=1, section='W10x49', material='A36')


# ─── Plate ────────────────────────────────────────────────────────────────────

class TestPlateModel:
    def test_valid_shell(self):
        plate = Plate(id=1, nodes=[1, 2, 3, 4], thickness=0.01, material='Concrete', type='shell')
        assert plate.type == 'shell'

    def test_valid_membrane(self):
        plate = Plate(id=1, nodes=[1, 2, 3, 4], thickness=0.005, material='Steel', type='membrane')
        assert plate.type == 'membrane'

    def test_rejects_invalid_type(self):
        with pytest.raises(ValidationError):
            Plate(id=1, nodes=[1, 2, 3, 4], thickness=0.01, material='Concrete', type='invalid')

    def test_rejects_wrong_node_count(self):
        with pytest.raises(ValidationError):
            Plate(id=1, nodes=[1, 2, 3], thickness=0.01, material='Concrete', type='shell')


# ─── Material ─────────────────────────────────────────────────────────────────

class TestMaterialModel:
    def test_valid_material(self):
        mat = Material(
            id='A36', name='Steel A36',
            E=200e9, G=77e9, nu=0.3, rho=7850, fy=250e6
        )
        assert mat.id == 'A36'
        assert mat.E == 200e9

    def test_rejects_negative_E(self):
        with pytest.raises(ValidationError):
            Material(
                id='Bad', name='Bad Material',
                E=-1.0, G=77e9, nu=0.3, rho=7850, fy=250e6
            )


# ─── StructuralModel ──────────────────────────────────────────────────────────

class TestStructuralModel:
    def test_valid_complete_model(self):
        model = StructuralModel(
            nodes=[
                Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 1]),
                Node(id=2, x=5.0, y=0.0, restraints=[0, 0, 0]),
            ],
            members=[
                Member(id=1, i=1, j=2, section='W10x49', material='A36'),
            ],
            plates=[],
            materials=[
                Material(id='A36', name='Steel A36', E=200e9, G=77e9, nu=0.3, rho=7850, fy=250e6),
            ],
            sections=[
                Section(id='W10x49', name='W10x49', A=9.29e-3, Iz=2.07e-4, Iy=5.16e-5, J=3.4e-7, Sz=4.52e-4, Sy=1.61e-4),
            ],
            loads=[
                PointLoad(type='point', node=2, Fx=0.0, Fy=-10000.0, Mz=0.0),
            ],
        )
        assert len(model.nodes) == 2
        assert len(model.members) == 1
        assert len(model.loads) == 1


# ─── Results Models ───────────────────────────────────────────────────────────

class TestResultsModel:
    def test_member_forces_have_two_end_values(self):
        mf = MemberForces(id=1, N=[100.0, -100.0], V=[50.0, -50.0], M=[0.0, 200.0])
        assert len(mf.N) == 2
        assert len(mf.V) == 2
        assert len(mf.M) == 2

    def test_member_forces_rejects_wrong_length(self):
        with pytest.raises(ValidationError):
            MemberForces(id=1, N=[100.0], V=[50.0, -50.0], M=[0.0, 200.0])

    def test_full_analysis_results(self):
        results = AnalysisResults(
            displacements=[NodeDisplacement(node=1, ux=0.0, uy=0.0, rz=0.0)],
            member_forces=[MemberForces(id=1, N=[0.0, 0.0], V=[5000.0, -5000.0], M=[0.0, 25000.0])],
            reactions=[Reaction(node=1, Fx=0.0, Fy=10000.0, Mz=0.0)],
            plate_stresses=[],
        )
        assert len(results.displacements) == 1
        assert len(results.reactions) == 1
