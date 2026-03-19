import type { CoordinateSystem } from '../CoordinateSystem'

interface LineElementProps {
  p1: { x: number; y: number }
  p2: { x: number; y: number }
  coordSystem: CoordinateSystem
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
}

export function LineElement({
  p1,
  p2,
  coordSystem,
  stroke = '#555',
  strokeWidth = 1.5,
  strokeDasharray,
}: LineElementProps) {
  const sp1 = coordSystem.worldToScreen(p1.x, p1.y)
  const sp2 = coordSystem.worldToScreen(p2.x, p2.y)

  return (
    <line
      x1={sp1.x}
      y1={sp1.y}
      x2={sp2.x}
      y2={sp2.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      style={{ pointerEvents: 'inherit' }}
    />
  )
}
