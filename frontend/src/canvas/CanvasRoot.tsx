import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useUiStore } from '../store/uiStore'
import { CoordinateSystem } from './CoordinateSystem'
import { Grid } from './Grid'
import { GeometryLayer } from './layers/GeometryLayer'
import { LoadsLayer } from './layers/LoadsLayer'
import { useCanvasClick } from './tools/useTool'

const ZOOM_FACTOR_IN = 1.1
const ZOOM_FACTOR_OUT = 0.9
const ZOOM_MIN = 0.1
const ZOOM_MAX = 50

export function CanvasRoot() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewport, setViewport] = useState({ width: 800, height: 600 })

  const zoom = useUiStore((s) => s.zoom)
  const panOffset = useUiStore((s) => s.panOffset)
  const gridSnap = useUiStore((s) => s.gridSnap)
  const gridSize = useUiStore((s) => s.gridSize)
  const layers = useUiStore((s) => s.layers)
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
  const handleCanvasClick = useCanvasClick(coordSystem)

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isPanningRef.current || !lastMouseRef.current) return
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy })
    },
    [panOffset, setPanOffset]
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
  }, [])

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: isPanning ? 'grabbing' : 'crosshair',
        background: '#fafafa',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
    >
      {/* Grid layer */}
      <Grid coordSystem={coordSystem} gridSize={gridSize} />

      {/* Geometry layer */}
      {layers.geometry && <GeometryLayer coordSystem={coordSystem} />}

      {/* Loads layer */}
      {layers.loads && <LoadsLayer coordSystem={coordSystem} />}

      {/* Results layer */}
      {layers.results && <g id="layer-results" />}

      {/* Annotations layer */}
      {layers.annotations && <g id="layer-annotations" />}

      {/* Selection layer */}
      {layers.selection && <g id="layer-selection" />}

    </svg>
  )
}
