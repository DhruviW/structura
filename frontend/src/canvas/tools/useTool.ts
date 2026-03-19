import React, { useCallback, useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'
import type { CoordinateSystem } from '../CoordinateSystem'
import { handleNodeToolClick } from './NodeTool'
import { handleSelectToolClick } from './SelectTool'
import { handleMemberToolClick, resetMemberTool } from './MemberTool'
import { handlePlateToolClick, resetPlateTool } from './PlateTool'
import { findNearestNode } from './snapUtils'
import { handleDimensionToolClick, resetDimensionTool } from './DimensionTool'
import { handleTextToolClick, resetTextTool } from './TextTool'
import { handleLeaderToolClick, resetLeaderTool } from './LeaderTool'
import { handleLineToolClick, resetLineTool } from './LineTool'
import { handlePolylineToolClick, handlePolylineToolDoubleClick, resetPolylineTool } from './PolylineTool'
import { handleRectangleToolClick, resetRectangleTool } from './RectangleTool'
import { handleCircleToolClick, resetCircleTool } from './CircleTool'

export function useCanvasClick(coordSystem: CoordinateSystem) {
  const activeMode = useUiStore((s) => s.activeMode)
  const annotateSubMode = useUiStore((s) => s.annotateSubMode)
  const gridSnap = useUiStore((s) => s.gridSnap)
  const gridSize = useUiStore((s) => s.gridSize)

  // Reset tools when mode changes
  useEffect(() => {
    resetMemberTool()
    resetPlateTool()
    resetDimensionTool()
    resetTextTool()
    resetLeaderTool()
    resetLineTool()
    resetPolylineTool()
    resetRectangleTool()
    resetCircleTool()
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
        case 'dimension':
          handleDimensionToolClick(world.x, world.y)
          break
        case 'annotate':
          switch (annotateSubMode) {
            case 'dimension':
              handleDimensionToolClick(world.x, world.y)
              break
            case 'text':
              handleTextToolClick(world.x, world.y)
              break
            case 'leader':
              handleLeaderToolClick(world.x, world.y)
              break
            case 'line':
              handleLineToolClick(world.x, world.y)
              break
            case 'polyline':
              handlePolylineToolClick(world.x, world.y)
              break
            case 'rectangle':
              handleRectangleToolClick(world.x, world.y)
              break
            case 'circle':
              handleCircleToolClick(world.x, world.y)
              break
            default:
              break
          }
          break
        default:
          break
      }
    },
    [activeMode, annotateSubMode, gridSnap, gridSize, coordSystem]
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

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (activeMode === 'annotate' && annotateSubMode === 'polyline') {
        e.preventDefault()
        handlePolylineToolDoubleClick()
      }
    },
    [activeMode, annotateSubMode]
  )

  return { handleClick, handleMouseMove, handleDoubleClick }
}
