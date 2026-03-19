import React from 'react'

interface MemberElementProps {
  x1: number
  y1: number
  x2: number
  y2: number
  id: number
  selected: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function MemberElement({ x1, y1, x2, y2, id, selected, onClick }: MemberElementProps) {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onClick?.(e) }}
      style={{ cursor: onClick ? 'pointer' : 'default', pointerEvents: 'all' }}
    >
      {/* Invisible wider hit area */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} />
      {selected && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#2196F3"
          strokeWidth={6}
          strokeOpacity={0.3}
        />
      )}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#333"
        strokeWidth={2}
      />
      <text
        x={midX + 4}
        y={midY - 4}
        fontSize={10}
        fill="#333"
        style={{ userSelect: 'none' }}
      >
        M{id}
      </text>
    </g>
  )
}
