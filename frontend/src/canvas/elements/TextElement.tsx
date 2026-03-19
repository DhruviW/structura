import type { CoordinateSystem } from '../CoordinateSystem'

interface TextElementProps {
  position: { x: number; y: number }
  text: string
  fontSize?: number
  coordSystem: CoordinateSystem
}

export function TextElement({ position, text, fontSize = 12, coordSystem }: TextElementProps) {
  const screen = coordSystem.worldToScreen(position.x, position.y)

  return (
    <text
      x={screen.x}
      y={screen.y}
      fontSize={fontSize}
      fill="#333"
      fontFamily="sans-serif"
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      {text}
    </text>
  )
}
