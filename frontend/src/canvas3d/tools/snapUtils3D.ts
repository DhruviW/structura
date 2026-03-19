import { useModelStore } from '../../store/modelStore'

export interface NearestNode3D {
  id: number
  x: number
  y: number
  z: number
  distance: number
}

export function findNearestNode3D(
  x: number,
  y: number,
  z: number,
  threshold = 0.5
): NearestNode3D | null {
  const nodes = useModelStore.getState().nodes
  let nearest: NearestNode3D | null = null

  for (const node of nodes) {
    const dist = Math.sqrt(
      (node.x - x) ** 2 +
      (node.y - y) ** 2 +
      (node.z - z) ** 2
    )
    if (dist < threshold && (!nearest || dist < nearest.distance)) {
      nearest = { id: node.id, x: node.x, y: node.y, z: node.z, distance: dist }
    }
  }

  return nearest
}
