import React, { useCallback } from 'react'
import { useUiStore } from '../../store/uiStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { handleNodeToolClick } from './NodeTool'
import { handleSelectToolClick } from './SelectTool'

export function useCanvasClick(coordSystem: CoordinateSystem) {
  const activeMode = useUiStore((s) => s.activeMode)
  const gridSnap = useUiStore((s) => s.gridSnap)
  const gridSize = useUiStore((s) => s.gridSize)

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Only handle plain left click (not shift, not middle)
      if (e.button !== 0 || e.shiftKey) return

      const rect = e.currentTarget.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top

      let { x: worldX, y: worldY } = coordSystem.screenToWorld(sx, sy)

      if (gridSnap) {
        const snapped = coordSystem.snapToGrid(worldX, worldY, gridSize)
        worldX = snapped.x
        worldY = snapped.y
      }

      switch (activeMode) {
        case 'node':
          handleNodeToolClick(worldX, worldY)
          break
        case 'select':
          handleSelectToolClick(null)
          break
        default:
          break
      }
    },
    [activeMode, gridSnap, gridSize, coordSystem]
  )

  return handleClick
}
