import React from 'react'
import { useModelStore } from '../../store/modelStore'
import { useResultsStore } from '../../store/resultsStore'
import { LoadArrow } from '../elements/LoadArrow'
import type { CoordinateSystem } from '../CoordinateSystem'

interface Props {
  coordSystem: CoordinateSystem
}

export function ReactionArrows({ coordSystem }: Props) {
  const nodes = useModelStore((s) => s.nodes)
  const results = useResultsStore((s) => s.results)

  if (!results) return null

  return (
    <g id="reaction-arrows">
      {results.reactions.map((reaction) => {
        const node = nodes.find((n) => n.id === reaction.node)
        if (!node) return null

        const s = coordSystem.worldToScreen(node.x, node.y)

        // Reactions oppose loads, so negate signs
        const Fx = -reaction.Fx
        const Fy = -reaction.Fy

        return (
          <g key={`reaction-${reaction.node}`}>
            <LoadArrow
              screenX={s.x}
              screenY={s.y}
              Fx={Fx}
              Fy={Fy}
              scale={0.5}
            />
            <text
              x={s.x + 4}
              y={s.y + 20}
              fontSize={9}
              fill="#D32F2F"
              style={{ userSelect: 'none' }}
            >
              Fy: {reaction.Fy.toFixed(1)} kN
            </text>
          </g>
        )
      })}
    </g>
  )
}
