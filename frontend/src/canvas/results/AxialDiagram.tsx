import { useModelStore } from '../../store/modelStore'
import { useResultsStore } from '../../store/resultsStore'
import type { CoordinateSystem } from '../CoordinateSystem'

interface Props {
  coordSystem: CoordinateSystem
}

export function AxialDiagram({ coordSystem }: Props) {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const results = useResultsStore((s) => s.results)
  const diagramScale = useResultsStore((s) => s.diagramScale)

  if (!results) return null

  const scale = diagramScale * 0.0001

  return (
    <g id="axial-diagram">
      {results.member_forces.map((mf) => {
        const member = members.find((m) => m.id === mf.id)
        if (!member) return null

        const nodeI = nodes.find((n) => n.id === member.i)
        const nodeJ = nodes.find((n) => n.id === member.j)
        if (!nodeI || !nodeJ) return null

        const pi = coordSystem.worldToScreen(nodeI.x, nodeI.y)
        const pj = coordSystem.worldToScreen(nodeJ.x, nodeJ.y)

        const dx = pj.x - pi.x
        const dy = pj.y - pi.y
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len === 0) return null

        const nx = -dy / len
        const ny = dx / len

        const Fi = mf.N[0]
        const Fj = mf.N[1]

        const p1x = pi.x
        const p1y = pi.y
        const p2x = pi.x + nx * Fi * scale
        const p2y = pi.y + ny * Fi * scale
        const p3x = pj.x + nx * Fj * scale
        const p3y = pj.y + ny * Fj * scale
        const p4x = pj.x
        const p4y = pj.y

        const points = `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`

        // Negative N = compression (red), positive N = tension (blue)
        // Use average of end values to determine color
        const avgN = (Fi + Fj) / 2
        const fillColor = avgN < 0 ? 'rgba(244,67,54,0.3)' : 'rgba(33,150,243,0.3)'
        const strokeColor = avgN < 0 ? '#F44336' : '#2196F3'
        const textColor = avgN < 0 ? '#C62828' : '#1565C0'

        return (
          <g key={mf.id}>
            <polygon
              points={points}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <text
              x={p2x}
              y={p2y}
              fontSize={9}
              fill={textColor}
              textAnchor="middle"
              style={{ userSelect: 'none' }}
            >
              {Fi.toFixed(1)}
            </text>
            <text
              x={p3x}
              y={p3y}
              fontSize={9}
              fill={textColor}
              textAnchor="middle"
              style={{ userSelect: 'none' }}
            >
              {Fj.toFixed(1)}
            </text>
          </g>
        )
      })}
    </g>
  )
}
