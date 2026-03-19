interface Point {
  x: number
  y: number
}

import React from 'react'

interface PlateElementProps {
  points: Point[]
  id: number
  selected: boolean
  onClick?: (e: React.MouseEvent) => void
}

function computeCentroid(points: Point[]): Point {
  const n = points.length
  if (n === 0) return { x: 0, y: 0 }
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / n, y: sum.y / n }
}

export function PlateElement({ points, id, selected, onClick }: PlateElementProps) {
  if (points.length < 3) return null

  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')
  const centroid = computeCentroid(points)

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <polygon
        points={pointsStr}
        fill={selected ? 'rgba(33, 150, 243, 0.2)' : 'rgba(180, 180, 180, 0.3)'}
        stroke={selected ? '#2196F3' : '#666'}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x={centroid.x}
        y={centroid.y}
        fontSize={10}
        fill="#333"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ userSelect: 'none' }}
      >
        P{id}
      </text>
    </g>
  )
}
