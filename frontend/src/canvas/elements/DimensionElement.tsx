import type { CoordinateSystem } from '../CoordinateSystem'

interface DimensionElementProps {
  p1: { x: number; y: number }
  p2: { x: number; y: number }
  offset: number
  text?: string
  coordSystem: CoordinateSystem
}

export function DimensionElement({ p1, p2, offset, text, coordSystem }: DimensionElementProps) {
  // Direction vector
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null

  // Unit vector along the line
  const ux = dx / len
  const uy = dy / len

  // Perpendicular unit vector (rotated 90 degrees)
  const px = -uy
  const py = ux

  // Offset points (world)
  const op1 = { x: p1.x + px * offset, y: p1.y + py * offset }
  const op2 = { x: p2.x + px * offset, y: p2.y + py * offset }

  // Convert to screen
  const sp1 = coordSystem.worldToScreen(p1.x, p1.y)
  const sp2 = coordSystem.worldToScreen(p2.x, p2.y)
  const sop1 = coordSystem.worldToScreen(op1.x, op1.y)
  const sop2 = coordSystem.worldToScreen(op2.x, op2.y)

  // Midpoint for text
  const midScreen = {
    x: (sop1.x + sop2.x) / 2,
    y: (sop1.y + sop2.y) / 2,
  }

  // Arrow size in screen pixels
  const ARROW_SIZE = 8
  const TICK_LEN = 6

  // Arrow direction (along dimension line in screen space)
  const sdx = sop2.x - sop1.x
  const sdy = sop2.y - sop1.y
  const slen = Math.sqrt(sdx * sdx + sdy * sdy)
  const sux = slen > 0 ? sdx / slen : 1
  const suy = slen > 0 ? sdy / slen : 0

  // Arrow at sop1 (pointing away from sop2)
  const arrow1 = [
    `${sop1.x},${sop1.y}`,
    `${sop1.x + sux * ARROW_SIZE + suy * ARROW_SIZE * 0.3},${sop1.y + suy * ARROW_SIZE - sux * ARROW_SIZE * 0.3}`,
    `${sop1.x + sux * ARROW_SIZE - suy * ARROW_SIZE * 0.3},${sop1.y + suy * ARROW_SIZE + sux * ARROW_SIZE * 0.3}`,
  ].join(' ')

  // Arrow at sop2 (pointing away from sop1)
  const arrow2 = [
    `${sop2.x},${sop2.y}`,
    `${sop2.x - sux * ARROW_SIZE + suy * ARROW_SIZE * 0.3},${sop2.y - suy * ARROW_SIZE - sux * ARROW_SIZE * 0.3}`,
    `${sop2.x - sux * ARROW_SIZE - suy * ARROW_SIZE * 0.3},${sop2.y - suy * ARROW_SIZE + sux * ARROW_SIZE * 0.3}`,
  ].join(' ')

  // Tick marks (perpendicular to dimension line, at each endpoint)
  const spx = -suy  // perpendicular screen direction
  const spy = sux

  const color = '#333'
  const strokeWidth = 1.5

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Extension lines from endpoints to offset line */}
      <line x1={sp1.x} y1={sp1.y} x2={sop1.x} y2={sop1.y}
        stroke={color} strokeWidth={strokeWidth} />
      <line x1={sp2.x} y1={sp2.y} x2={sop2.x} y2={sop2.y}
        stroke={color} strokeWidth={strokeWidth} />

      {/* Dimension line */}
      <line x1={sop1.x} y1={sop1.y} x2={sop2.x} y2={sop2.y}
        stroke={color} strokeWidth={strokeWidth} />

      {/* Tick marks at offset endpoints */}
      <line
        x1={sop1.x - spx * TICK_LEN} y1={sop1.y - spy * TICK_LEN}
        x2={sop1.x + spx * TICK_LEN} y2={sop1.y + spy * TICK_LEN}
        stroke={color} strokeWidth={strokeWidth} />
      <line
        x1={sop2.x - spx * TICK_LEN} y1={sop2.y - spy * TICK_LEN}
        x2={sop2.x + spx * TICK_LEN} y2={sop2.y + spy * TICK_LEN}
        stroke={color} strokeWidth={strokeWidth} />

      {/* Arrowheads */}
      <polygon points={arrow1} fill={color} />
      <polygon points={arrow2} fill={color} />

      {/* Measurement text */}
      {text && (
        <text
          x={midScreen.x}
          y={midScreen.y - 5}
          textAnchor="middle"
          fontSize={11}
          fill={color}
          fontFamily="sans-serif"
        >
          {text}
        </text>
      )}
    </g>
  )
}
