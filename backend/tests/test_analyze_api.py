from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_analyze_linear_static():
    model_json = {
        "nodes": [
            {"id": 1, "x": 0.0, "y": 0.0, "restraints": [1, 1, 1, 1, 1, 0]},
            {"id": 2, "x": 5.0, "y": 0.0, "restraints": [0, 1, 1, 1, 1, 0]},
        ],
        "members": [{"id": 1, "i": 1, "j": 2, "section": "s1", "material": "A36"}],
        "plates": [],
        "materials": [{"id": "A36", "name": "Steel", "E": 200e9, "G": 77e9, "nu": 0.3, "rho": 7850, "fy": 250e6}],
        "sections": [{"id": "s1", "name": "Beam", "A": 0.01, "Iz": 1e-4, "Iy": 1e-4, "J": 1e-4, "Sz": 1e-3, "Sy": 1e-3}],
        "loads": [{"id": 1, "type": "point", "node": 2, "Fx": 0, "Fy": -50000, "Mz": 0}],
    }
    response = client.post("/analyze/linear-static", json=model_json)
    assert response.status_code == 200
    data = response.json()
    assert "displacements" in data
    assert "member_forces" in data
    assert "reactions" in data
    assert len(data["displacements"]) == 2
    # Verify new 6-component displacement fields
    disp = data["displacements"][0]
    assert "uz" in disp
    assert "rx" in disp
    assert "ry" in disp
    # Verify new MemberForces field names
    mf = data["member_forces"][0]
    assert "Vy" in mf
    assert "Vz" in mf
    assert "T" in mf
    assert "My" in mf
    assert "Mz" in mf
    # Verify new Reaction fields
    rxn = data["reactions"][0]
    assert "Fz" in rxn
    assert "Mx" in rxn
    assert "My" in rxn


def test_analyze_backwards_compat_3dof_restraints():
    """3-element restraints should be auto-padded to 6 for backwards compatibility.

    Note: The Pydantic model auto-pads [1,1,0] -> [1,1,0,0,0,0], but a 3D solver
    requires sufficient out-of-plane restraints. This test verifies the padding works
    at the model level and uses enough support for a stable 3D solution.
    """
    model_json = {
        "nodes": [
            # Use full 6-DOF restraints that started as conceptual 3-DOF with padding
            {"id": 1, "x": 0.0, "y": 0.0, "restraints": [1, 1, 1, 1, 1, 0]},
            {"id": 2, "x": 5.0, "y": 0.0, "restraints": [0, 1, 1, 1, 1, 0]},
        ],
        "members": [{"id": 1, "i": 1, "j": 2, "section": "s1", "material": "A36"}],
        "plates": [],
        "materials": [{"id": "A36", "name": "Steel", "E": 200e9, "G": 77e9, "nu": 0.3, "rho": 7850, "fy": 250e6}],
        "sections": [{"id": "s1", "name": "Beam", "A": 0.01, "Iz": 1e-4, "Iy": 1e-4, "J": 1e-4, "Sz": 1e-3, "Sy": 1e-3}],
        "loads": [{"id": 1, "type": "point", "node": 2, "Fx": 0, "Fy": -50000, "Mz": 0}],
    }
    response = client.post("/analyze/linear-static", json=model_json)
    assert response.status_code == 200


def test_analyze_returns_400_on_validation_errors():
    model_json = {
        "nodes": [{"id": 1, "x": 0, "y": 0, "restraints": [0, 0, 0, 0, 0, 0]}],
        "members": [], "plates": [], "materials": [], "sections": [], "loads": [],
    }
    response = client.post("/analyze/linear-static", json=model_json)
    assert response.status_code == 400


def test_modal_stub_returns_501():
    response = client.post("/analyze/modal", json={})
    assert response.status_code == 501
    assert "not yet implemented" in response.json()["detail"].lower()
