import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useUiStore } from '../store/uiStore'
import { useModelStore } from '../store/modelStore'
import { CoordinateSystem } from './CoordinateSystem'
import { Grid } from './Grid'
import { GeometryLayer } from './layers/GeometryLayer'
import { LoadsLayer } from './layers/LoadsLayer'
import { ResultsLayer } from './results/ResultsLayer'
import { PreviewLayer } from './layers/PreviewLayer'
import { SupportPopup } from './popups/SupportPopup'
import { LoadPopup } from './popups/LoadPopup'
import { TextInputPopup } from './popups/TextInputPopup'
import { AnnotationsLayer } from './layers/AnnotationsLayer'
import { useCanvasClick } from './tools/useTool'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const ZOOM_FACTOR_IN = 1.1
const ZOOM_FACTOR_OUT = 0.9
const ZOOM_MIN = 0.1
const ZOOM_MAX = 50

const CURSOR_BY_MODE: Record<string, string> = {
  select: 'default',
  node: 'crosshair',
  member: 'crosshair',
  plate: 'crosshair',
  support: 'crosshair',
  load: 'crosshair',
  dimension: 'crosshair',
  annotate: 'text',
  erase: 'not-allowed',
}

export function CanvasRoot() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewport, setViewport] = useState({ width: 800, height: 600 })

  const zoom = useUiStore((s) => s.zoom)
  const panOffset = useUiStore((s) => s.panOffset)
  const gridSize = useUiStore((s) => s.gridSize)
  const layers = useUiStore((s) => s.layers)
  const activeMode = useUiStore((s) => s.activeMode)
  const setZoom = useUiStore((s) => s.setZoom)
  const setPanOffset = useUiStore((s) => s.setPanOffset)
  const setSelectionBox = useUiStore((s) => s.setSelectionBox)
  const clearSelectionBox = useUiStore((s) => s.clearSelectionBox)
  const selectElement = useUiStore((s) => s.selectElement)
  const clearSelection = useUiStore((s) => s.clearSelection)

  // Keyboard shortcuts
  useKeyboardShortcuts()

  const isPanningRef = useRef(false)
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  // Box selection tracking
  const isBoxSelectingRef = useRef(false)
  const boxStartRef = useRef<{ x: number; y: number } | null>(null)

  // ResizeObserver to track SVG container size
  useEffect(() => {
    if (!svgRef.current) return
    const el = svgRef.current
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setViewport({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const coordSystem = new CoordinateSystem(zoom, panOffset, viewport)
  const { handleClick, handleMouseMove, handleDoubleClick } = useCanvasClick(coordSystem)

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? ZOOM_FACTOR_IN : ZOOM_FACTOR_OUT
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * factor))
      setZoom(newZoom)
    },
    [zoom, setZoom]
  )

  // Pan start: middle mouse or shift+left click
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const isMiddleMouse = e.button === 1
      const isShiftLeft = e.button === 0 && e.shiftKey
      if (isMiddleMouse || isShiftLeft) {
        e.preventDefault()
        isPanningRef.current = true
        lastMouseRef.current = { x: e.clientX, y: e.clientY }
        setIsPanning(true)
        return
      }

      // Box selection: plain left click in select mode on the canvas background
      if (e.button === 0 && !e.shiftKey && activeMode === 'select') {
        const rect = e.currentTarget.getBoundingClientRect()
        const sx = e.clientX - rect.left
        const sy = e.clientY - rect.top
        isBoxSelectingRef.current = true
        boxStartRef.current = { x: sx, y: sy }
        setSelectionBox({ startX: sx, startY: sy, endX: sx, endY: sy })
      }
    },
    [activeMode, setSelectionBox]
  )

  const handleMouseMoveCombined = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Pan logic
      if (isPanningRef.current && lastMouseRef.current) {
        const dx = e.clientX - lastMouseRef.current.x
        const dy = e.clientY - lastMouseRef.current.y
        lastMouseRef.current = { x: e.clientX, y: e.clientY }
        setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy })
      }

      // Box selection: update end coords
      if (isBoxSelectingRef.current && boxStartRef.current) {
        const rect = e.currentTarget.getBoundingClientRect()
        const sx = e.clientX - rect.left
        const sy = e.clientY - rect.top
        setSelectionBox({
          startX: boxStartRef.current.x,
          startY: boxStartRef.current.y,
          endX: sx,
          endY: sy,
        })
      }

      // Preview/cursor tracking
      handleMouseMove(e, isPanningRef.current)
    },
    [panOffset, setPanOffset, handleMouseMove, setSelectionBox]
  )

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
    lastMouseRef.current = null
    setIsPanning(false)

    // Finalize box selection
    if (isBoxSelectingRef.current && boxStartRef.current) {
      const box = useUiStore.getState().selectionBox
      if (box) {
        const minX = Math.min(box.startX, box.endX)
        const maxX = Math.max(box.startX, box.endX)
        const minY = Math.min(box.startY, box.endY)
        const maxY = Math.max(box.startY, box.endY)

        // Only do box selection if the box has a meaningful size
        const BOX_THRESHOLD = 4
        if (maxX - minX > BOX_THRESHOLD || maxY - minY > BOX_THRESHOLD) {
          const coordSys = new CoordinateSystem(
            useUiStore.getState().zoom,
            useUiStore.getState().panOffset,
            viewport
          )
          const modelState = useModelStore.getState()
          clearSelection()

          // Select nodes inside the box
          for (const node of modelState.nodes) {
            const pos = coordSys.worldToScreen(node.x, node.y)
            if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
              selectElement({ type: 'node', id: node.id })
            }
          }

          // Select members whose both endpoints are inside the box
          for (const member of modelState.members) {
            const nodeI = modelState.nodes.find((n) => n.id === member.i)
            const nodeJ = modelState.nodes.find((n) => n.id === member.j)
            if (nodeI && nodeJ) {
              const posI = coordSys.worldToScreen(nodeI.x, nodeI.y)
              const posJ = coordSys.worldToScreen(nodeJ.x, nodeJ.y)
              if (
                posI.x >= minX && posI.x <= maxX && posI.y >= minY && posI.y <= maxY &&
                posJ.x >= minX && posJ.x <= maxX && posJ.y >= minY && posJ.y <= maxY
              ) {
                selectElement({ type: 'member', id: member.id })
              }
            }
          }

          // Select plates whose all nodes are inside the box
          for (const plate of modelState.plates) {
            const allInside = plate.nodes.every((nid) => {
              const node = modelState.nodes.find((n) => n.id === nid)
              if (!node) return false
              const pos = coordSys.worldToScreen(node.x, node.y)
              return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY
            })
            if (allInside) {
              selectElement({ type: 'plate', id: plate.id })
            }
          }
        }
      }
    }

    isBoxSelectingRef.current = false
    boxStartRef.current = null
    clearSelectionBox()
  }, [viewport, clearSelection, selectElement, clearSelectionBox])

  const handleMouseLeave = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false
      lastMouseRef.current = null
      setIsPanning(false)
    }
    if (isBoxSelectingRef.current) {
      isBoxSelectingRef.current = false
      boxStartRef.current = null
      clearSelectionBox()
    }
    useUiStore.getState().setCursorWorldPos(null)
    useUiStore.getState().setNearestNodeId(null)
  }, [clearSelectionBox])

  const modeCursor = CURSOR_BY_MODE[activeMode] ?? 'crosshair'
  const cursor = isPanning ? 'grabbing' : modeCursor

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor,
          background: '#fafafa',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveCombined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Grid layer */}
        <Grid coordSystem={coordSystem} gridSize={gridSize} />

        {/* Geometry layer */}
        {layers.geometry && <GeometryLayer coordSystem={coordSystem} />}

        {/* Loads layer */}
        {layers.loads && <LoadsLayer coordSystem={coordSystem} />}

        {/* Results layer */}
        {layers.results && <ResultsLayer coordSystem={coordSystem} />}

        {/* Annotations layer */}
        {layers.annotations && <AnnotationsLayer coordSystem={coordSystem} />}

        {/* Selection layer */}
        {layers.selection && <g id="layer-selection" />}

        {/* Preview layer (always on top inside SVG) */}
        <PreviewLayer coordSystem={coordSystem} />
      </svg>

      {/* HTML overlays for popups */}
      <SupportPopup coordSystem={coordSystem} />
      <LoadPopup coordSystem={coordSystem} />
      <TextInputPopup coordSystem={coordSystem} />
    </div>
  )
}
