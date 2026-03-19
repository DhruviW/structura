import { useModelStore } from '../../store/modelStore'
import { useResultsStore } from '../../store/resultsStore'
import type { CoordinateSystem } from '../CoordinateSystem'

interface Props {
  coordSystem: CoordinateSystem
}

export function DeflectedShape({ coordSystem }: Props) {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const results = useResultsStore((s) => s.results)
  const deflectionMagnification = useResultsStore((s) => s.deflectionMagnification)

  if (!results) return null

  // Build a map from node id to displacement
  const dispMap = new Map<number, { ux: number; uy: number }>()
  for (const d of results.displacements) {
    dispMap.set(d.node, { ux: d.ux, uy: d.uy })
  }

  // Helper: get displaced world position for a node
  function displacedPos(nodeId: number): { x: number; y: number } | null {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return null
    const disp = dispMap.get(nodeId) ?? { ux: 0, uy: 0 }
    return {
      x: node.x + disp.ux * deflectionMagnification,
      y: node.y + disp.uy * deflectionMagnification,
    }
  }

  return (
    <g id="deflected-shape">
      {members.map((member) => {
        const posI = displacedPos(member.i)
        const posJ = displacedPos(member.j)
        if (!posI || !posJ) return null

        const sI = coordSystem.worldToScreen(posI.x, posI.y)
        const sJ = coordSystem.worldToScreen(posJ.x, posJ.y)

        return (
          <line
            key={`deflected-member-${member.id}`}
            x1={sI.x}
            y1={sI.y}
            x2={sJ.x}
            y2={sJ.y}
            stroke="#999"
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
        )
      })}

      {nodes.map((node) => {
        const pos = displacedPos(node.id)
        if (!pos) return null
        const s = coordSystem.worldToScreen(pos.x, pos.y)
        return (
          <circle
            key={`deflected-node-${node.id}`}
            cx={s.x}
            cy={s.y}
            r={3}
            fill="#999"
          />
        )
      })}
    </g>
  )
}
