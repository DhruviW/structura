import React from 'react'

interface LoadArrowProps {
  screenX: number
  screenY: number
  Fx: number
  Fy: number
  scale?: number
}

const ARROW_COLOR = '#D32F2F'
const ARROW_LENGTH = 40
const ARROWHEAD_SIZE = 6

function ArrowHead({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }) {
  // Normalize direction
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null
  const nx = dx / len
  const ny = dy / len
  // Perpendicular
  const px = -ny
  const py = nx

  const tip = { x, y }
  const base1 = {
    x: x - nx * ARROWHEAD_SIZE + px * ARROWHEAD_SIZE * 0.5,
    y: y - ny * ARROWHEAD_SIZE + py * ARROWHEAD_SIZE * 0.5,
  }
  const base2 = {
    x: x - nx * ARROWHEAD_SIZE - px * ARROWHEAD_SIZE * 0.5,
    y: y - ny * ARROWHEAD_SIZE - py * ARROWHEAD_SIZE * 0.5,
  }

  const points = `${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`
  return <polygon points={points} fill={ARROW_COLOR} />
}

export function LoadArrow({ screenX, screenY, Fx, Fy, scale = 1 }: LoadArrowProps) {
  const elements: React.ReactElement[] = []

  if (Fx !== 0) {
    const dir = Fx > 0 ? 1 : -1
    const endX = screenX + dir * ARROW_LENGTH * scale
    elements.push(
      <line
        key="fx-line"
        x1={screenX}
        y1={screenY}
        x2={endX}
        y2={screenY}
        stroke={ARROW_COLOR}
        strokeWidth={2}
      />
    )
    elements.push(
      <ArrowHead key="fx-head" x={endX} y={screenY} dx={dir} dy={0} />
    )
    elements.push(
      <text
        key="fx-label"
        x={endX + dir * 4}
        y={screenY - 4}
        fontSize={10}
        fill={ARROW_COLOR}
        textAnchor={dir > 0 ? 'start' : 'end'}
        style={{ userSelect: 'none' }}
      >
        {Fx.toFixed(1)} kN
      </text>
    )
  }

  if (Fy !== 0) {
    // Y is inverted on screen: positive Fy is up in world = negative screen Y direction
    const dir = Fy > 0 ? -1 : 1
    const endY = screenY + dir * ARROW_LENGTH * scale
    elements.push(
      <line
        key="fy-line"
        x1={screenX}
        y1={screenY}
        x2={screenX}
        y2={endY}
        stroke={ARROW_COLOR}
        strokeWidth={2}
      />
    )
    elements.push(
      <ArrowHead key="fy-head" x={screenX} y={endY} dx={0} dy={dir} />
    )
    elements.push(
      <text
        key="fy-label"
        x={screenX + 4}
        y={endY - dir * 4}
        fontSize={10}
        fill={ARROW_COLOR}
        style={{ userSelect: 'none' }}
      >
        {Fy.toFixed(1)} kN
      </text>
    )
  }

  return <g>{elements}</g>
}
