import type { CoordinateSystem } from '../CoordinateSystem'

interface RectangleElementProps {
  corner1: { x: number; y: number }
  corner2: { x: number; y: number }
  coordSystem: CoordinateSystem
  stroke?: string
  strokeWidth?: number
  fill?: string
  strokeDasharray?: string
}

export function RectangleElement({
  corner1,
  corner2,
  coordSystem,
  stroke = '#555',
  strokeWidth = 1.5,
  fill = 'none',
  strokeDasharray,
}: RectangleElementProps) {
  const sc1 = coordSystem.worldToScreen(corner1.x, corner1.y)
  const sc2 = coordSystem.worldToScreen(corner2.x, corner2.y)

  const x = Math.min(sc1.x, sc2.x)
  const y = Math.min(sc1.y, sc2.y)
  const width = Math.abs(sc2.x - sc1.x)
  const height = Math.abs(sc2.y - sc1.y)

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      style={{ pointerEvents: 'inherit' }}
    />
  )
}
