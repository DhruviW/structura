import React from 'react'
import { useModelStore } from '../../store/modelStore'
import { useUiStore } from '../../store/uiStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { NodeElement } from '../elements/NodeElement'
import { MemberElement } from '../elements/MemberElement'
import { PlateElement } from '../elements/PlateElement'
import { SupportSymbol } from '../elements/SupportSymbol'
import type { SupportType } from '../../types/model'

interface GeometryLayerProps {
  coordSystem: CoordinateSystem
}

function getSupportType(restraints: [0 | 1, 0 | 1, 0 | 1]): SupportType {
  const [rx, ry, rz] = restraints
  if (rx === 1 && ry === 1 && rz === 1) return 'fixed'
  if (rx === 1 && ry === 1 && rz === 0) return 'pin'
  if (rx === 0 && ry === 1 && rz === 0) return 'roller'
  return 'none'
}

export function GeometryLayer({ coordSystem }: GeometryLayerProps) {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const plates = useModelStore((s) => s.plates)
  const selectedElements = useUiStore((s) => s.selectedElements)
  const selectElement = useUiStore((s) => s.selectElement)
  const clearSelection = useUiStore((s) => s.clearSelection)

  function isSelected(type: 'node' | 'member' | 'plate', id: number): boolean {
    return selectedElements.some((el) => el.type === type && el.id === id)
  }

  function nodeScreenPos(nodeId: number) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return null
    return coordSystem.worldToScreen(node.x, node.y)
  }

  return (
    <g id="layer-geometry">
      {/* Plates (back) */}
      {plates.map((plate) => {
        const points = plate.nodes
          .map((nid) => nodeScreenPos(nid))
          .filter((p): p is { x: number; y: number } => p !== null)
        if (points.length < 3) return null
        return (
          <PlateElement
            key={`plate-${plate.id}`}
            points={points}
            id={plate.id}
            selected={isSelected('plate', plate.id)}
            onClick={() => {
              clearSelection()
              selectElement({ type: 'plate', id: plate.id })
            }}
          />
        )
      })}

      {/* Members (middle) */}
      {members.map((member) => {
        const posI = nodeScreenPos(member.i)
        const posJ = nodeScreenPos(member.j)
        if (!posI || !posJ) return null
        return (
          <MemberElement
            key={`member-${member.id}`}
            x1={posI.x}
            y1={posI.y}
            x2={posJ.x}
            y2={posJ.y}
            id={member.id}
            selected={isSelected('member', member.id)}
            onClick={() => {
              clearSelection()
              selectElement({ type: 'member', id: member.id })
            }}
          />
        )
      })}

      {/* Nodes + SupportSymbols (front) */}
      {nodes.map((node) => {
        const pos = coordSystem.worldToScreen(node.x, node.y)
        const supportType = getSupportType(node.restraints)
        return (
          <g key={`node-${node.id}`}>
            {supportType !== 'none' && (
              <SupportSymbol
                screenX={pos.x}
                screenY={pos.y}
                type={supportType}
              />
            )}
            <NodeElement
              screenX={pos.x}
              screenY={pos.y}
              id={node.id}
              selected={isSelected('node', node.id)}
              onClick={() => {
                clearSelection()
                selectElement({ type: 'node', id: node.id })
              }}
            />
          </g>
        )
      })}
    </g>
  )
}
