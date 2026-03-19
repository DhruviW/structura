import { useThree } from '@react-three/fiber'
import { useCallback } from 'react'
import * as THREE from 'three'
import { useUiStore } from '../../store/uiStore'

export function useGroundPlaneClick() {
  const { camera, raycaster, pointer } = useThree()
  const viewMode = useUiStore((s) => s.viewMode)
  const gridSnap = useUiStore((s) => s.gridSnap)
  const gridSize = useUiStore((s) => s.gridSize)

  return useCallback((_e: any) => {
    // Raycast against a ground plane (XZ plane in Three.js, Y=0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersect = new THREE.Vector3()
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(plane, intersect)

    if (!hit) return null

    // Convert Three.js coords back to engineering coords
    // Three.js X = World X, Three.js Z = -World Y, Three.js Y = World Z
    let wx = intersect.x
    let wy = -intersect.z  // Three.js Z = -World Y
    let wz = intersect.y   // Three.js Y = World Z

    // For 2D views, constrain to the view plane
    if (viewMode === 'plan-xy') wz = 0
    if (viewMode === 'elevation-xz') wy = 0
    if (viewMode === 'elevation-yz') wx = 0

    // Grid snap
    if (gridSnap) {
      wx = Math.round(wx / gridSize) * gridSize
      wy = Math.round(wy / gridSize) * gridSize
      wz = Math.round(wz / gridSize) * gridSize
    }

    return { x: wx, y: wy, z: wz }
  }, [camera, raycaster, pointer, viewMode, gridSnap, gridSize])
}
