import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useUiStore } from '../store/uiStore'
import { CoordinateSystem } from './CoordinateSystem'
import { Grid } from './Grid'
import { GeometryLayer } from './layers/GeometryLayer'
import { LoadsLayer } from './layers/LoadsLayer'
import { ResultsLayer } from './results/ResultsLayer'
import { PreviewLayer } from './layers/PreviewLayer'
import { SupportPopup } from './popups/SupportPopup'
import { LoadPopup } from './popups/LoadPopup'
import { useCanvasClick } from './tools/useTool'

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

  const isPanningRef = useRef(false)
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

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
  const { handleClick, handleMouseMove } = useCanvasClick(coordSystem)

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
      }
    },
    []
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
      // Preview/cursor tracking
      handleMouseMove(e, isPanningRef.current)
    },
    [panOffset, setPanOffset, handleMouseMove]
  )

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
    lastMouseRef.current = null
    setIsPanning(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false
      lastMouseRef.current = null
      setIsPanning(false)
    }
    useUiStore.getState().setCursorWorldPos(null)
    useUiStore.getState().setNearestNodeId(null)
  }, [])

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
        {layers.annotations && <g id="layer-annotations" />}

        {/* Selection layer */}
        {layers.selection && <g id="layer-selection" />}

        {/* Preview layer (always on top inside SVG) */}
        <PreviewLayer coordSystem={coordSystem} />
      </svg>

      {/* HTML overlays for popups */}
      <SupportPopup coordSystem={coordSystem} />
      <LoadPopup coordSystem={coordSystem} />
    </div>
  )
}
