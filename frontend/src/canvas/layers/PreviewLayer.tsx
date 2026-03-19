import { useUiStore } from '../../store/uiStore'
import { useModelStore } from '../../store/modelStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { CircleElement } from '../elements/CircleElement'

interface PreviewLayerProps {
  coordSystem: CoordinateSystem
}

export function PreviewLayer({ coordSystem }: PreviewLayerProps) {
  const activeMode = useUiStore((s) => s.activeMode)
  const annotateSubMode = useUiStore((s) => s.annotateSubMode)
  const previewState = useUiStore((s) => s.previewState)
  const selectionBox = useUiStore((s) => s.selectionBox)
  const nodes = useModelStore((s) => s.nodes)

  const {
    memberFirstNodeId,
    plateSelectedNodeIds,
    cursorWorldPos,
    nearestNodeId,
    dimensionFirstPoint,
    lineFirstPoint,
    polylinePoints,
    rectangleFirstCorner,
    circleCenter,
  } = previewState

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

      {/* Dimension preview: dashed line from first point to cursor */}
      {(activeMode === 'dimension' || (activeMode === 'annotate' && annotateSubMode === 'dimension')) &&
        dimensionFirstPoint !== null && cursorWorldPos && (() => {
          const sp1 = coordSystem.worldToScreen(dimensionFirstPoint.x, dimensionFirstPoint.y)
          const sp2 = coordSystem.worldToScreen(cursorWorldPos.x, cursorWorldPos.y)
          return (
            <line
              x1={sp1.x} y1={sp1.y} x2={sp2.x} y2={sp2.y}
              stroke="#FF9800" strokeWidth={1.5} strokeDasharray="6 4"
              style={{ pointerEvents: 'none' }}
            />
          )
        })()}

      {/* Line preview: dashed line from first point to cursor */}
      {activeMode === 'annotate' && annotateSubMode === 'line' &&
        lineFirstPoint !== null && cursorWorldPos && (() => {
          const sp1 = coordSystem.worldToScreen(lineFirstPoint.x, lineFirstPoint.y)
          const sp2 = coordSystem.worldToScreen(cursorWorldPos.x, cursorWorldPos.y)
          return (
            <line
              x1={sp1.x} y1={sp1.y} x2={sp2.x} y2={sp2.y}
              stroke="#555" strokeWidth={1.5} strokeDasharray="6 4"
              style={{ pointerEvents: 'none' }}
            />
          )
        })()}

      {/* Polyline preview: solid lines through confirmed points + dashed to cursor */}
      {activeMode === 'annotate' && annotateSubMode === 'polyline' && polylinePoints.length > 0 && (() => {
        const confirmed = polylinePoints.map((p) => coordSystem.worldToScreen(p.x, p.y))
        const confirmedStr = confirmed.map((p) => `${p.x},${p.y}`).join(' ')
        return (
          <>
            {confirmed.length >= 2 && (
              <polyline
                points={confirmedStr}
                fill="none"
                stroke="#555"
                strokeWidth={1.5}
                style={{ pointerEvents: 'none' }}
              />
            )}
            {cursorScreen && (() => {
              const last = confirmed[confirmed.length - 1]
              return (
                <line
                  x1={last.x} y1={last.y} x2={cursorScreen.x} y2={cursorScreen.y}
                  stroke="#555" strokeWidth={1.5} strokeDasharray="6 4"
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()}
            {confirmed.map((pos, i) => (
              <circle key={i} cx={pos.x} cy={pos.y} r={4}
                fill="#555" fillOpacity={0.5} style={{ pointerEvents: 'none' }} />
            ))}
          </>
        )
      })()}

      {/* Rectangle preview: dashed rect from first corner to cursor */}
      {activeMode === 'annotate' && annotateSubMode === 'rectangle' &&
        rectangleFirstCorner !== null && cursorWorldPos && (() => {
          const sc1 = coordSystem.worldToScreen(rectangleFirstCorner.x, rectangleFirstCorner.y)
          const sc2 = coordSystem.worldToScreen(cursorWorldPos.x, cursorWorldPos.y)
          const rx = Math.min(sc1.x, sc2.x)
          const ry = Math.min(sc1.y, sc2.y)
          const rw = Math.abs(sc2.x - sc1.x)
          const rh = Math.abs(sc2.y - sc1.y)
          return (
            <rect
              x={rx} y={ry} width={rw} height={rh}
              fill="none" stroke="#555" strokeWidth={1.5} strokeDasharray="6 4"
              style={{ pointerEvents: 'none' }}
            />
          )
        })()}

      {/* Circle preview: dashed circle from center to cursor */}
      {activeMode === 'annotate' && annotateSubMode === 'circle' &&
        circleCenter !== null && cursorWorldPos && (() => {
          const dx = cursorWorldPos.x - circleCenter.x
          const dy = cursorWorldPos.y - circleCenter.y
          const radius = Math.sqrt(dx * dx + dy * dy)
          return (
            <CircleElement
              center={circleCenter}
              radius={radius}
              coordSystem={coordSystem}
              stroke="#555"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          )
        })()}
    </g>
  )
}
