import { useModelStore } from '../../store/modelStore'

export function findNearestNode(
  worldX: number,
  worldY: number,
  threshold: number = 0.5
): { id: number; x: number; y: number; distance: number } | null {
  const nodes = useModelStore.getState().nodes
  let nearest: { id: number; x: number; y: number; distance: number } | null = null
  for (const node of nodes) {
    const dx = node.x - worldX
    const dy = node.y - worldY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < threshold && (!nearest || dist < nearest.distance)) {
      nearest = { id: node.id, x: node.x, y: node.y, distance: dist }
    }
  }
  return nearest
}
