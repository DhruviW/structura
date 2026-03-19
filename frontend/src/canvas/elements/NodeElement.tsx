import React from 'react'

interface NodeElementProps {
  screenX: number
  screenY: number
  id: number
  selected: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function NodeElement({ screenX, screenY, id, selected, onClick }: NodeElementProps) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {selected && (
        <circle
          cx={screenX}
          cy={screenY}
          r={8}
          fill="none"
          stroke="#2196F3"
          strokeWidth={2}
        />
      )}
      <circle
        cx={screenX}
        cy={screenY}
        r={4}
        fill="#333"
        stroke="none"
      />
      <text
        x={screenX + 6}
        y={screenY - 6}
        fontSize={10}
        fill="#333"
        style={{ userSelect: 'none' }}
      >
        {id}
      </text>
    </g>
  )
}
