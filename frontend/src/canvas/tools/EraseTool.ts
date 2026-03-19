/**
 * Erase tool: click on any element to immediately delete it.
 * Cascades for nodes (removes connected members, loads).
 */
import { useModelStore } from '../../store/modelStore'
import { useAnnotationStore } from '../../store/annotationStore'

export function handleEraseNode(nodeId: number) {
  const store = useModelStore.getState()
  // Cascade: remove members referencing this node
  const membersToRemove = store.members.filter(m => m.i === nodeId || m.j === nodeId)
  for (let i = membersToRemove.length - 1; i >= 0; i--) {
    store.removeMember(membersToRemove[i].id)
  }
  // Cascade: remove point loads on this node
  const loadsToRemove = store.loads.filter(l => l.type === 'point' && l.node === nodeId)
  for (let i = loadsToRemove.length - 1; i >= 0; i--) {
    store.removeLoad(loadsToRemove[i].id)
  }
  store.removeNode(nodeId)
}

export function handleEraseMember(memberId: number) {
  useModelStore.getState().removeMember(memberId)
}

export function handleErasePlate(plateId: number) {
  useModelStore.getState().removePlate(plateId)
}

export function handleEraseAnnotation(annotationId: number) {
  useAnnotationStore.getState().removeAnnotation(annotationId)
}
