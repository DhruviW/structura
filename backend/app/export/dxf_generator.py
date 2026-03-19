"""
DXF export generator for structural analysis models.
Converts StructuralModel (and optional AnalysisResults) into an ezdxf Drawing.
"""
from __future__ import annotations

import io
from typing import Optional, Union

import ezdxf
from ezdxf.document import Drawing

from app.models.structural import StructuralModel
from app.models.results import AnalysisResults


class _DXFDocument:
    """
    Thin wrapper around ezdxf.Drawing that transparently handles both
    text (StringIO) and binary (BytesIO) streams in the write() method.
    All attribute access is proxied to the underlying Drawing.
    """

    def __init__(self, doc: Drawing):
        object.__setattr__(self, "_doc", doc)

    # ── Proxy attribute access ────────────────────────────────────────────────
    def __getattr__(self, name: str):
        return getattr(object.__getattribute__(self, "_doc"), name)

    def __setattr__(self, name: str, value):
        setattr(object.__getattribute__(self, "_doc"), name, value)

    # ── Override write to handle BytesIO ─────────────────────────────────────
    def write(self, stream: Union[io.IOBase, "io.RawIOBase"], fmt: str = "asc") -> None:
        doc = object.__getattribute__(self, "_doc")
        # If binary stream, use binary DXF format
        if isinstance(stream, (io.RawIOBase, io.BufferedIOBase, io.BytesIO)):
            doc.write(stream, fmt="bin")
        else:
            doc.write(stream, fmt=fmt)

    # Ensure iteration over layers still works via proxy
    def __iter__(self):
        return iter(object.__getattribute__(self, "_doc"))


# ─── Layer definitions ────────────────────────────────────────────────────────

_BASE_LAYERS = [
    ("GEOMETRY",    7),   # white
    ("SUPPORTS",   30),   # orange
    ("LOADS",       1),   # red
    ("DIMENSIONS",  3),   # green
    ("ANNOTATIONS", 5),   # blue
    ("TITLEBLOCK",  8),   # grey
]

_RESULTS_LAYERS = [
    ("RESULTS-MOMENT",    5),  # blue
    ("RESULTS-SHEAR",     3),  # green
    ("RESULTS-AXIAL",     1),  # red
    ("RESULTS-DEFLECTED", 8),  # grey
]


# ─── Support block names ──────────────────────────────────────────────────────

_BLOCK_PIN    = "PIN_SUPPORT"
_BLOCK_ROLLER = "ROLLER_SUPPORT"
_BLOCK_FIXED  = "FIXED_SUPPORT"


def _determine_support_type(restraints: list[int]) -> Optional[str]:
    """Return block name for the node's restraints, or None if free.
    Works with both 3-DOF [Ux, Uy, Rz] and 6-DOF [Ux, Uy, Uz, Rx, Ry, Rz] restraints.
    """
    rx = restraints[0]
    ry = restraints[1]
    rz = restraints[2] if len(restraints) == 3 else restraints[5]
    if rx == 1 and ry == 1 and rz == 1:
        return _BLOCK_FIXED
    if rx == 1 and ry == 1 and rz == 0:
        return _BLOCK_PIN
    if rx == 0 and ry == 1 and rz == 0:
        return _BLOCK_ROLLER
    return None


def _create_layers(doc: Drawing, include_results: bool) -> None:
    layers = _BASE_LAYERS + (_RESULTS_LAYERS if include_results else [])
    for name, color in layers:
        if name not in doc.layers:
            doc.layers.new(name=name, dxfattribs={"color": color})


def _create_support_blocks(doc: Drawing, node_radius: float = 0.05) -> None:
    """Define reusable support symbols as DXF blocks."""
    tri_size = node_radius * 4

    # PIN SUPPORT — triangle pointing down
    if _BLOCK_PIN not in doc.blocks:
        blk = doc.blocks.new(name=_BLOCK_PIN)
        pts = [
            (0, 0),
            (-tri_size, -tri_size * 1.5),
            (tri_size, -tri_size * 1.5),
            (0, 0),
        ]
        blk.add_lwpolyline(pts, dxfattribs={"layer": "SUPPORTS"})
        # Hatch lines at bottom
        for i in range(5):
            x = -tri_size + i * (tri_size / 2)
            blk.add_line(
                (x, -tri_size * 1.5),
                (x - tri_size * 0.4, -tri_size * 2.0),
                dxfattribs={"layer": "SUPPORTS"},
            )

    # ROLLER SUPPORT — triangle + circle at bottom
    if _BLOCK_ROLLER not in doc.blocks:
        blk = doc.blocks.new(name=_BLOCK_ROLLER)
        pts = [
            (0, 0),
            (-tri_size, -tri_size * 1.5),
            (tri_size, -tri_size * 1.5),
            (0, 0),
        ]
        blk.add_lwpolyline(pts, dxfattribs={"layer": "SUPPORTS"})
        blk.add_circle(
            (0, -tri_size * 1.7),
            tri_size * 0.3,
            dxfattribs={"layer": "SUPPORTS"},
        )

    # FIXED SUPPORT — solid thick line
    if _BLOCK_FIXED not in doc.blocks:
        blk = doc.blocks.new(name=_BLOCK_FIXED)
        blk.add_line(
            (-tri_size * 1.2, 0),
            (tri_size * 1.2, 0),
            dxfattribs={"layer": "SUPPORTS", "lineweight": 70},
        )
        for i in range(7):
            x = -tri_size * 1.2 + i * (tri_size * 2.4 / 6)
            blk.add_line(
                (x, 0),
                (x - tri_size * 0.4, -tri_size * 0.6),
                dxfattribs={"layer": "SUPPORTS"},
            )


def generate_dxf(
    model: StructuralModel,
    results: Optional[AnalysisResults] = None,
    version: str = "R2010",
) -> Drawing:
    """
    Generate a DXF Drawing from a StructuralModel (and optional AnalysisResults).

    Returns an ezdxf Drawing object that can be written to a file or stream.
    """
    doc = ezdxf.new(dxfversion=version)
    msp = doc.modelspace()

    include_results = results is not None
    _create_layers(doc, include_results)
    _create_support_blocks(doc)

    # Build a quick node lookup by id
    node_map = {n.id: n for n in model.nodes}
    node_radius = 0.05

    # ── Draw nodes ────────────────────────────────────────────────────────────
    for node in model.nodes:
        msp.add_circle(
            center=(node.x, node.y),
            radius=node_radius,
            dxfattribs={"layer": "GEOMETRY"},
        )
        msp.add_text(
            f"N{node.id}",
            dxfattribs={
                "layer": "ANNOTATIONS",
                "height": node_radius * 2,
                "insert": (node.x + node_radius * 1.5, node.y + node_radius * 1.5),
            },
        )

    # ── Draw members ─────────────────────────────────────────────────────────
    for member in model.members:
        ni = node_map[member.i]
        nj = node_map[member.j]
        msp.add_line(
            start=(ni.x, ni.y),
            end=(nj.x, nj.y),
            dxfattribs={"layer": "GEOMETRY", "lineweight": 50},
        )
        # Label at midpoint
        mx = (ni.x + nj.x) / 2
        my = (ni.y + nj.y) / 2
        msp.add_text(
            f"M{member.id}",
            dxfattribs={
                "layer": "ANNOTATIONS",
                "height": node_radius * 1.5,
                "insert": (mx + node_radius, my + node_radius),
            },
        )

    # ── Draw supports ─────────────────────────────────────────────────────────
    for node in model.nodes:
        block_name = _determine_support_type(node.restraints)
        if block_name:
            msp.add_blockref(
                block_name,
                insert=(node.x, node.y),
                dxfattribs={"layer": "SUPPORTS"},
            )

    # ── Draw point loads ─────────────────────────────────────────────────────
    arrow_scale = 0.5
    for load in model.loads:
        if load.type == "point":
            node = node_map.get(load.node)
            if node is None:
                continue
            # Draw Fy arrow (vertical)
            if load.Fy != 0:
                direction = 1.0 if load.Fy > 0 else -1.0
                start = (node.x, node.y + direction * arrow_scale)
                end = (node.x, node.y)
                msp.add_line(start, end, dxfattribs={"layer": "LOADS"})
                # Arrowhead lines
                ah = node_radius * 2
                msp.add_line(
                    end,
                    (end[0] - ah * 0.5, end[1] + direction * ah),
                    dxfattribs={"layer": "LOADS"},
                )
                msp.add_line(
                    end,
                    (end[0] + ah * 0.5, end[1] + direction * ah),
                    dxfattribs={"layer": "LOADS"},
                )
                msp.add_text(
                    f"Fy={load.Fy/1000:.1f}kN",
                    dxfattribs={
                        "layer": "LOADS",
                        "height": node_radius * 1.5,
                        "insert": (node.x + node_radius, node.y + direction * arrow_scale * 0.5),
                    },
                )
            # Draw Fx arrow (horizontal)
            if load.Fx != 0:
                direction = 1.0 if load.Fx > 0 else -1.0
                start = (node.x + direction * arrow_scale, node.y)
                end = (node.x, node.y)
                msp.add_line(start, end, dxfattribs={"layer": "LOADS"})
                ah = node_radius * 2
                msp.add_line(
                    end,
                    (end[0] + direction * ah, end[1] - ah * 0.5),
                    dxfattribs={"layer": "LOADS"},
                )
                msp.add_line(
                    end,
                    (end[0] + direction * ah, end[1] + ah * 0.5),
                    dxfattribs={"layer": "LOADS"},
                )
                msp.add_text(
                    f"Fx={load.Fx/1000:.1f}kN",
                    dxfattribs={
                        "layer": "LOADS",
                        "height": node_radius * 1.5,
                        "insert": (node.x + direction * arrow_scale * 0.5, node.y + node_radius),
                    },
                )

    # ── Draw results (if provided) ────────────────────────────────────────────
    if results is not None:
        _draw_results(doc, msp, model, results, node_map, node_radius)

    return _DXFDocument(doc)


def _draw_results(
    doc: Drawing,
    msp,
    model: StructuralModel,
    results: AnalysisResults,
    node_map: dict,
    node_radius: float,
) -> None:
    """Add result visualizations to the modelspace."""
    disp_map = {d.node: d for d in results.displacements}
    forces_map = {f.id: f for f in results.member_forces}

    # Deflected shape
    scale_factor = 100.0
    for member in model.members:
        ni = node_map[member.i]
        nj = node_map[member.j]
        di = disp_map.get(member.i)
        dj = disp_map.get(member.j)
        if di and dj:
            start = (ni.x + di.ux * scale_factor, ni.y + di.uy * scale_factor)
            end = (nj.x + dj.ux * scale_factor, nj.y + dj.uy * scale_factor)
            msp.add_line(start, end, dxfattribs={"layer": "RESULTS-DEFLECTED"})

    # Moment diagram labels at member ends
    for member in model.members:
        forces = forces_map.get(member.id)
        if forces is None:
            continue
        ni = node_map[member.i]
        nj = node_map[member.j]
        mx = (ni.x + nj.x) / 2
        my = (ni.y + nj.y) / 2
        m_max = max(abs(forces.Mz[0]), abs(forces.Mz[1]))
        msp.add_text(
            f"Mmax={m_max/1000:.1f}kNm",
            dxfattribs={
                "layer": "RESULTS-MOMENT",
                "height": node_radius * 1.5,
                "insert": (mx, my + node_radius * 4),
            },
        )
        v_max = max(abs(forces.Vy[0]), abs(forces.Vy[1]))
        msp.add_text(
            f"Vmax={v_max/1000:.1f}kN",
            dxfattribs={
                "layer": "RESULTS-SHEAR",
                "height": node_radius * 1.5,
                "insert": (mx, my - node_radius * 4),
            },
        )
        n_max = max(abs(forces.N[0]), abs(forces.N[1]))
        msp.add_text(
            f"Nmax={n_max/1000:.1f}kN",
            dxfattribs={
                "layer": "RESULTS-AXIAL",
                "height": node_radius * 1.5,
                "insert": (mx, my + node_radius * 2),
            },
        )
