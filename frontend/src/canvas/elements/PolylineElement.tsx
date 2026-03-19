import type { CoordinateSystem } from '../CoordinateSystem'

interface PolylineElementProps {
  points: { x: number; y: number }[]
  closed: boolean
  coordSystem: CoordinateSystem
  stroke?: string
  strokeWidth?: number
  fill?: string
  strokeDasharray?: string
}

export function PolylineElement({
  points,
  closed,
  coordSystem,
  stroke = '#555',
  strokeWidth = 1.5,
  fill = 'none',
  strokeDasharray,
}: PolylineElementProps) {
  if (points.length < 2) return null

  const screenPoints = points.map((p) => coordSystem.worldToScreen(p.x, p.y))
  const pointsStr = screenPoints.map((p) => `${p.x},${p.y}`).join(' ')

  if (closed) {
    return (
      <polygon
        points={pointsStr}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        style={{ pointerEvents: 'inherit' }}
      />
    )
  }

  return (
    <polyline
      points={pointsStr}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      style={{ pointerEvents: 'inherit' }}
    />
  )
}
