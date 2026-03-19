"""
DXF importer: parses an ezdxf Drawing into a structural model dict.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

import ezdxf
from ezdxf.document import Drawing


def _round_coord(v: float, precision: int = 6) -> float:
    """Round a coordinate for deduplication purposes."""
    return round(v, precision)


def _coord_key(x: float, y: float) -> Tuple[float, float]:
    return (_round_coord(x), _round_coord(y))


def parse_dxf_to_model(doc: Drawing) -> dict:
    """
    Parse an ezdxf Drawing into a structural model dictionary.

    Returns a dict with keys:
        nodes, members, plates, materials, sections, loads

    Each node dict: {id, x, y, restraints}
    Each member dict: {id, i, j, section, material}
    """
    nodes: List[dict] = []
    members: List[dict] = []

    # Map from (x, y) coord tuple → node id
    coord_to_id: Dict[Tuple[float, float], int] = {}

    def get_or_create_node(x: float, y: float) -> int:
        key = _coord_key(x, y)
        if key not in coord_to_id:
            node_id = len(nodes) + 1
            coord_to_id[key] = node_id
            nodes.append({
                "id": node_id,
                "x": key[0],
                "y": key[1],
                "restraints": [0, 0, 0],
            })
        return coord_to_id[key]

    msp = doc.modelspace()

    for entity in msp:
        dxftype = entity.dxftype()

        if dxftype == "LINE":
            start = entity.dxf.start
            end = entity.dxf.end
            i = get_or_create_node(start.x, start.y)
            j = get_or_create_node(end.x, end.y)
            if i != j:
                member_id = len(members) + 1
                members.append({
                    "id": member_id,
                    "i": i,
                    "j": j,
                    "section": "default",
                    "material": "default",
                })

        elif dxftype in ("LWPOLYLINE", "POLYLINE"):
            if dxftype == "LWPOLYLINE":
                points = list(entity.get_points())
                coords = [(p[0], p[1]) for p in points]
            else:
                coords = [(v.dxf.location.x, v.dxf.location.y) for v in entity.vertices]

            prev_id = None
            for x, y in coords:
                node_id = get_or_create_node(x, y)
                if prev_id is not None and prev_id != node_id:
                    member_id = len(members) + 1
                    members.append({
                        "id": member_id,
                        "i": prev_id,
                        "j": node_id,
                        "section": "default",
                        "material": "default",
                    })
                prev_id = node_id

        elif dxftype in ("POINT", "CIRCLE"):
            if dxftype == "POINT":
                loc = entity.dxf.location
            else:
                loc = entity.dxf.center
            get_or_create_node(loc.x, loc.y)

    return {
        "nodes": nodes,
        "members": members,
        "plates": [],
        "materials": [],
        "sections": [],
        "loads": [],
    }
