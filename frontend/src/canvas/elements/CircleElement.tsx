import type { CoordinateSystem } from '../CoordinateSystem'

interface CircleElementProps {
  center: { x: number; y: number }
  radius: number
  coordSystem: CoordinateSystem
  stroke?: string
  strokeWidth?: number
  fill?: string
  strokeDasharray?: string
}

export function CircleElement({
  center,
  radius,
  coordSystem,
  stroke = '#555',
  strokeWidth = 1.5,
  fill = 'none',
  strokeDasharray,
}: CircleElementProps) {
  const sCenter = coordSystem.worldToScreen(center.x, center.y)
  // Convert radius: use a point offset by radius in world space, compute screen distance
  const sEdge = coordSystem.worldToScreen(center.x + radius, center.y)
  const screenRadius = Math.abs(sEdge.x - sCenter.x)

  return (
    <circle
      cx={sCenter.x}
      cy={sCenter.y}
      r={screenRadius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      style={{ pointerEvents: 'none' }}
    />
  )
}
