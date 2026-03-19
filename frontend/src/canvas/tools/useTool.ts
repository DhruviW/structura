import React, { useCallback, useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { handleNodeToolClick } from './NodeTool'
import { handleSelectToolClick } from './SelectTool'
import { handleMemberToolClick, resetMemberTool } from './MemberTool'
import { handlePlateToolClick, resetPlateTool } from './PlateTool'
import { findNearestNode } from './snapUtils'

export function useCanvasClick(coordSystem: CoordinateSystem) {
  const activeMode = useUiStore((s) => s.activeMode)
  const gridSnap = useUiStore((s) => s.gridSnap)
  const gridSize = useUiStore((s) => s.gridSize)

  // Reset tools when mode changes
  useEffect(() => {
    resetMemberTool()
    resetPlateTool()
    useUiStore.getState().clearPreview()
  }, [activeMode])

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Only handle plain left click (not shift, not middle)
      if (e.button !== 0 || e.shiftKey) return

      const rect = e.currentTarget.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top

      let world = coordSystem.screenToWorld(sx, sy)

      if (gridSnap) {
        world = coordSystem.snapToGrid(world.x, world.y, gridSize)
      }

      switch (activeMode) {
        case 'node':
          handleNodeToolClick(world.x, world.y)
          break
        case 'select':
          handleSelectToolClick(null)
          break
        case 'member': {
          const nearest = findNearestNode(world.x, world.y)
          if (nearest) handleMemberToolClick(nearest.id)
          break
        }
        case 'plate': {
          const nearest = findNearestNode(world.x, world.y)
          if (nearest) handlePlateToolClick(nearest.id)
          break
        }
        case 'support': {
          const nearest = findNearestNode(world.x, world.y)
          if (nearest) useUiStore.getState().setPendingSupportNodeId(nearest.id)
          break
        }
        case 'load': {
          const nearest = findNearestNode(world.x, world.y)
          if (nearest) useUiStore.getState().setPendingLoadNodeId(nearest.id)
          break
        }
        default:
          break
      }
    },
    [activeMode, gridSnap, gridSize, coordSystem]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>, isPanning: boolean) => {
      if (isPanning) return
      const rect = e.currentTarget.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      let world = coordSystem.screenToWorld(sx, sy)
      if (gridSnap) world = coordSystem.snapToGrid(world.x, world.y, gridSize)

      useUiStore.getState().setCursorWorldPos(world)
      const nearest = findNearestNode(world.x, world.y)
      useUiStore.getState().setNearestNodeId(nearest?.id ?? null)
    },
    [coordSystem, gridSnap, gridSize]
  )

  return { handleClick, handleMouseMove }
}
