import pytest
import ezdxf
import io
from app.models.structural import StructuralModel, Node, Member, Material, Section, PointLoad
from app.models.results import AnalysisResults, NodeDisplacement, MemberForces, Reaction
from app.export.dxf_generator import generate_dxf


def make_model_and_results():
    model = StructuralModel(
        nodes=[
            Node(id=1, x=0.0, y=0.0, restraints=[1, 1, 0]),
            Node(id=2, x=5.0, y=0.0, restraints=[0, 1, 0]),
        ],
        members=[Member(id=1, i=1, j=2, section="s1", material="A36")],
        plates=[],
        materials=[Material(id="A36", name="Steel", E=200e9, G=77e9, nu=0.3, rho=7850, fy=250e6)],
        sections=[],
        loads=[PointLoad(id=1, type="point", node=2, Fx=0, Fy=-50000, Mz=0)],
    )
    results = AnalysisResults(
        displacements=[
            NodeDisplacement(node=1, ux=0, uy=0, uz=0, rx=0, ry=0, rz=0),
            NodeDisplacement(node=2, ux=0, uy=-0.01, uz=0, rx=0, ry=0, rz=0),
        ],
        member_forces=[MemberForces(id=1, N=[0, 0], Vy=[25000, -25000], Vz=[0, 0],
                                    T=[0, 0], My=[0, 0], Mz=[0, 62500])],
        reactions=[Reaction(node=1, Fx=0, Fy=25000, Fz=0, Mx=0, My=0, Mz=0)],
        plate_stresses=[],
    )
    return model, results


class TestDXFExport:
    def test_generates_valid_dxf(self):
        model, results = make_model_and_results()
        doc = generate_dxf(model, results)
        assert doc is not None

    def test_has_required_layers(self):
        model, results = make_model_and_results()
        doc = generate_dxf(model, results)
        layer_names = [l.dxf.name for l in doc.layers]
        assert 'GEOMETRY' in layer_names
        assert 'SUPPORTS' in layer_names
        assert 'LOADS' in layer_names
        assert 'ANNOTATIONS' in layer_names

    def test_has_member_lines_on_geometry_layer(self):
        model, results = make_model_and_results()
        doc = generate_dxf(model, results)
        msp = doc.modelspace()
        geom_entities = [e for e in msp if e.dxf.layer == 'GEOMETRY']
        assert len(geom_entities) > 0

    def test_writes_to_stream(self):
        model, results = make_model_and_results()
        doc = generate_dxf(model, results)
        stream = io.BytesIO()
        doc.write(stream)
        stream.seek(0)
        assert len(stream.read()) > 0
