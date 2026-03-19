import ezdxf
from app.export.dxf_importer import parse_dxf_to_model


class TestDXFImport:
    def test_lines_become_members(self):
        doc = ezdxf.new()
        msp = doc.modelspace()
        msp.add_line((0, 0), (5, 0))
        msp.add_line((5, 0), (5, 3))
        model = parse_dxf_to_model(doc)
        assert len(model["nodes"]) >= 3
        assert len(model["members"]) == 2

    def test_points_become_nodes(self):
        doc = ezdxf.new()
        msp = doc.modelspace()
        msp.add_point((1.0, 2.0))
        model = parse_dxf_to_model(doc)
        assert any(n["x"] == 1.0 and n["y"] == 2.0 for n in model["nodes"])

    def test_materials_default_to_placeholder(self):
        doc = ezdxf.new()
        msp = doc.modelspace()
        msp.add_line((0, 0), (5, 0))
        model = parse_dxf_to_model(doc)
        for member in model["members"]:
            assert member["material"] == "default"
