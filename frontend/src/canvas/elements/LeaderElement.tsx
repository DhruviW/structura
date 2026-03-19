import type { CoordinateSystem } from '../CoordinateSystem'

interface LeaderElementProps {
  point: { x: number; y: number }
  textPosition: { x: number; y: number }
  text: string
  coordSystem: CoordinateSystem
}

export function LeaderElement({ point, textPosition, text, coordSystem }: LeaderElementProps) {
  const sPoint = coordSystem.worldToScreen(point.x, point.y)
  const sText = coordSystem.worldToScreen(textPosition.x, textPosition.y)

  const dx = sPoint.x - sText.x
  const dy = sPoint.y - sText.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const ARROW_SIZE = 8

  let arrowPoints = ''
  if (len > 0) {
    const ux = dx / len
    const uy = dy / len
    arrowPoints = [
      `${sPoint.x},${sPoint.y}`,
      `${sPoint.x - ux * ARROW_SIZE + uy * ARROW_SIZE * 0.3},${sPoint.y - uy * ARROW_SIZE - ux * ARROW_SIZE * 0.3}`,
      `${sPoint.x - ux * ARROW_SIZE - uy * ARROW_SIZE * 0.3},${sPoint.y - uy * ARROW_SIZE + ux * ARROW_SIZE * 0.3}`,
    ].join(' ')
  }

  return (
    <g style={{ pointerEvents: 'none' }}>
      <line
        x1={sText.x}
        y1={sText.y}
        x2={sPoint.x}
        y2={sPoint.y}
        stroke="#333"
        strokeWidth={1.5}
      />
      {arrowPoints && <polygon points={arrowPoints} fill="#333" />}
      <text
        x={sText.x}
        y={sText.y - 4}
        fontSize={12}
        fill="#333"
        fontFamily="sans-serif"
        style={{ userSelect: 'none' }}
      >
        {text}
      </text>
    </g>
  )
}
