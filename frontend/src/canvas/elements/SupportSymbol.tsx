import React from 'react'
import type { SupportType } from '../../types/model'

interface SupportSymbolProps {
  screenX: number
  screenY: number
  type: SupportType
}

const COLOR = '#E65100' // orange
const SIZE = 14

export function SupportSymbol({ screenX, screenY, type }: SupportSymbolProps) {
  if (type === 'none') return null

  // Triangle pointing up (apex at node), pointing downward for support symbol
  const trianglePoints = [
    `${screenX},${screenY}`,
    `${screenX - SIZE},${screenY + SIZE}`,
    `${screenX + SIZE},${screenY + SIZE}`,
  ].join(' ')

  const groundY = screenY + SIZE
  const groundLeft = screenX - SIZE - 4
  const groundRight = screenX + SIZE + 4

  if (type === 'pin') {
    return (
      <g>
        <polygon
          points={trianglePoints}
          fill="none"
          stroke={COLOR}
          strokeWidth={1.5}
        />
        {/* Ground line */}
        <line
          x1={groundLeft}
          y1={groundY}
          x2={groundRight}
          y2={groundY}
          stroke={COLOR}
          strokeWidth={1.5}
        />
      </g>
    )
  }

  if (type === 'roller') {
    const circleY = groundY + 4
    return (
      <g>
        <polygon
          points={trianglePoints}
          fill="none"
          stroke={COLOR}
          strokeWidth={1.5}
        />
        {/* Roller circles */}
        <circle cx={screenX - SIZE / 2} cy={circleY} r={3} fill="none" stroke={COLOR} strokeWidth={1.5} />
        <circle cx={screenX + SIZE / 2} cy={circleY} r={3} fill="none" stroke={COLOR} strokeWidth={1.5} />
        {/* Ground line below circles */}
        <line
          x1={groundLeft}
          y1={circleY + 4}
          x2={groundRight}
          y2={circleY + 4}
          stroke={COLOR}
          strokeWidth={1.5}
        />
      </g>
    )
  }

  if (type === 'fixed') {
    // Vertical bar + diagonal hatching
    const barX = screenX - SIZE
    const barWidth = SIZE * 2
    const hatchSpacing = 5
    const hatchLines: React.ReactElement[] = []
    const numHatches = Math.floor(barWidth / hatchSpacing) + 1
    for (let i = 0; i < numHatches; i++) {
      const x = barX + i * hatchSpacing
      hatchLines.push(
        <line
          key={i}
          x1={x}
          y1={groundY}
          x2={x - 5}
          y2={groundY + 6}
          stroke={COLOR}
          strokeWidth={1}
        />
      )
    }
    return (
      <g>
        {/* Vertical bar at node */}
        <line
          x1={screenX}
          y1={screenY - SIZE}
          x2={screenX}
          y2={groundY}
          stroke={COLOR}
          strokeWidth={2}
        />
        {/* Horizontal ground bar */}
        <line
          x1={barX}
          y1={groundY}
          x2={barX + barWidth}
          y2={groundY}
          stroke={COLOR}
          strokeWidth={2}
        />
        {/* Diagonal hatching lines */}
        {hatchLines}
      </g>
    )
  }

  return null
}
