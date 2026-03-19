import { useModelStore } from '../store/modelStore'

export function validateNodeReference(nodeId: number): { valid: boolean; message?: string } {
  const { nodes } = useModelStore.getState()
  const exists = nodes.some((n) => n.id === nodeId)
  if (!exists) {
    return { valid: false, message: `Node ${nodeId} does not exist` }
  }
  return { valid: true }
}

export function validateMaterialReference(materialId: string): { valid: boolean; message?: string } {
  const { materials } = useModelStore.getState()
  const exists = materials.some((m) => m.id === materialId)
  if (!exists) {
    return { valid: false, message: `Material "${materialId}" does not exist` }
  }
  return { valid: true }
}

export function validateMemberNodes(i: number, j: number): { valid: boolean; message?: string } {
  const { nodes } = useModelStore.getState()
  const nodeIds = new Set(nodes.map((n) => n.id))

  if (!nodeIds.has(i)) {
    return { valid: false, message: `Start node ${i} does not exist` }
  }
  if (!nodeIds.has(j)) {
    return { valid: false, message: `End node ${j} does not exist` }
  }
  if (i === j) {
    return { valid: false, message: 'Start and end nodes must be different' }
  }
  return { valid: true }
}
