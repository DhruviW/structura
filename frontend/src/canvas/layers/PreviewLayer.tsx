import { useUiStore } from '../../store/uiStore'
import { useModelStore } from '../../store/modelStore'
import type { CoordinateSystem } from '../CoordinateSystem'

interface PreviewLayerProps {
  coordSystem: CoordinateSystem
}

export function PreviewLayer({ coordSystem }: PreviewLayerProps) {
  const activeMode = useUiStore((s) => s.activeMode)
  const previewState = useUiStore((s) => s.previewState)
  const selectionBox = useUiStore((s) => s.selectionBox)
  const nodes = useModelStore((s) => s.nodes)

  const { memberFirstNodeId, plateSelectedNodeIds, cursorWorldPos, nearestNodeId } = previewState

  function getNodeScreenPos(nodeId: number) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return null
    return coordSystem.worldToScreen(node.x, node.y)
  }

  const cursorScreen = cursorWorldPos
    ? coordSystem.worldToScreen(cursorWorldPos.x, cursorWorldPos.y)
    : null

  return (
    <g id="layer-preview">
      {/* Box selection rectangle */}
      {selectionBox && (() => {
        const x = Math.min(selectionBox.startX, selectionBox.endX)
        const y = Math.min(selectionBox.startY, selectionBox.endY)
        const width = Math.abs(selectionBox.endX - selectionBox.startX)
        const height = Math.abs(selectionBox.endY - selectionBox.startY)
        return (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="#2196F3"
            fillOpacity={0.08}
            stroke="#2196F3"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}
      {/* Snap indicator: orange ring on nearest node */}
      {nearestNodeId !== null && (() => {
        const pos = getNodeScreenPos(nearestNodeId)
        if (!pos) return null
        return (
          <circle
            cx={pos.x}
            cy={pos.y}
            r={10}
            fill="none"
            stroke="orange"
            strokeWidth={2}
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}

      {/* Member preview: dashed blue line from first node to cursor */}
      {activeMode === 'member' && memberFirstNodeId !== null && cursorScreen && (() => {
        const firstPos = getNodeScreenPos(memberFirstNodeId)
        if (!firstPos) return null
        return (
          <line
            x1={firstPos.x}
            y1={firstPos.y}
            x2={cursorScreen.x}
            y2={cursorScreen.y}
            stroke="#2196F3"
            strokeWidth={2}
            strokeDasharray="6 4"
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}

      {/* Plate preview: dashed lines through selected nodes + to cursor */}
      {activeMode === 'plate' && plateSelectedNodeIds.length > 0 && (() => {
        const positions = plateSelectedNodeIds
          .map((id) => getNodeScreenPos(id))
          .filter((p): p is { x: number; y: number } => p !== null)

        if (positions.length === 0) return null

        const allPoints = cursorScreen ? [...positions, cursorScreen] : positions
        const pointsStr = allPoints.map((p) => `${p.x},${p.y}`).join(' ')

        return (
          <>
            <polyline
              points={pointsStr}
              fill="none"
              stroke="#9C27B0"
              strokeWidth={2}
              strokeDasharray="6 4"
              style={{ pointerEvents: 'none' }}
            />
            {positions.map((pos, i) => (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill="#9C27B0"
                fillOpacity={0.4}
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </>
        )
      })()}
    </g>
  )
}
