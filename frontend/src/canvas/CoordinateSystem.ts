// ─── Coordinate System ────────────────────────────────────────────────────────
// Converts between world coordinates (meters, Y-up engineering convention) and
// screen coordinates (pixels, Y-down SVG convention).

export const PIXELS_PER_UNIT = 50 // 50px per meter at zoom = 1

export interface Viewport {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export class CoordinateSystem {
  private zoom: number
  private panOffset: Point
  private viewport: Viewport

  constructor(zoom: number, panOffset: Point, viewport: Viewport) {
    this.zoom = zoom
    this.panOffset = panOffset
    this.viewport = viewport
  }

  /**
   * Convert world coordinates (meters, Y-up) to screen coordinates (pixels, Y-down).
   * Origin is at viewport center.
   */
  worldToScreen(wx: number, wy: number): Point {
    const cx = this.viewport.width / 2
    const cy = this.viewport.height / 2
    const scale = PIXELS_PER_UNIT * this.zoom
    return {
      x: cx + this.panOffset.x + wx * scale,
      y: cy + this.panOffset.y - wy * scale, // Y is inverted
    }
  }

  /**
   * Convert screen coordinates (pixels, Y-down) to world coordinates (meters, Y-up).
   * Inverse of worldToScreen.
   */
  screenToWorld(sx: number, sy: number): Point {
    const cx = this.viewport.width / 2
    const cy = this.viewport.height / 2
    const scale = PIXELS_PER_UNIT * this.zoom
    return {
      x: (sx - cx - this.panOffset.x) / scale,
      y: -(sy - cy - this.panOffset.y) / scale, // Y is inverted
    }
  }

  /**
   * Snap world coordinates to the nearest grid intersection.
   */
  snapToGrid(wx: number, wy: number, gridSize: number): Point {
    return {
      x: Math.round(wx / gridSize) * gridSize,
      y: Math.round(wy / gridSize) * gridSize,
    }
  }

  getZoom(): number {
    return this.zoom
  }

  getPanOffset(): Point {
    return { ...this.panOffset }
  }

  getViewport(): Viewport {
    return { ...this.viewport }
  }
}
