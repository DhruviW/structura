import React from 'react'
import { CoordinateSystem } from './CoordinateSystem'

interface GridProps {
  coordSystem: CoordinateSystem
  gridSize: number
}

export function Grid({ coordSystem, gridSize }: GridProps) {
  const viewport = coordSystem.getViewport()
  const { width, height } = viewport

  // Compute world-space bounds visible on screen
  const topLeft = coordSystem.screenToWorld(0, 0)
  const bottomRight = coordSystem.screenToWorld(width, height)

  const worldLeft = Math.min(topLeft.x, bottomRight.x)
  const worldRight = Math.max(topLeft.x, bottomRight.x)
  const worldBottom = Math.min(topLeft.y, bottomRight.y)
  const worldTop = Math.max(topLeft.y, bottomRight.y)

  const startX = Math.floor(worldLeft / gridSize) * gridSize
  const endX = Math.ceil(worldRight / gridSize) * gridSize
  const startY = Math.floor(worldBottom / gridSize) * gridSize
  const endY = Math.ceil(worldTop / gridSize) * gridSize

  const verticalLines: React.ReactElement[] = []
  for (let wx = startX; wx <= endX; wx += gridSize) {
    const sx = coordSystem.worldToScreen(wx, 0).x
    const isAxis = Math.abs(wx) < gridSize * 0.001
    verticalLines.push(
      <line
        key={`v-${wx.toFixed(6)}`}
        x1={sx}
        y1={0}
        x2={sx}
        y2={height}
        stroke={isAxis ? '#bbb' : '#e0e0e0'}
        strokeWidth={isAxis ? 1 : 0.5}
      />
    )
  }

  const horizontalLines: React.ReactElement[] = []
  for (let wy = startY; wy <= endY; wy += gridSize) {
    const sy = coordSystem.worldToScreen(0, wy).y
    const isAxis = Math.abs(wy) < gridSize * 0.001
    horizontalLines.push(
      <line
        key={`h-${wy.toFixed(6)}`}
        x1={0}
        y1={sy}
        x2={width}
        y2={sy}
        stroke={isAxis ? '#bbb' : '#e0e0e0'}
        strokeWidth={isAxis ? 1 : 0.5}
      />
    )
  }

  return (
    <g>
      {verticalLines}
      {horizontalLines}
    </g>
  )
}
