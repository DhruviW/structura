import { useUiStore } from '../../store/uiStore'
import { useModelStore } from '../../store/modelStore'

export function deleteSelectedElements() {
  const { selectedElements, clearSelection } = useUiStore.getState()
  const store = useModelStore.getState()

  for (const el of selectedElements) {
    if (el.type === 'node') {
      // Cascade: delete members referencing this node (collect ids first)
      const membersToRemove = store.members.filter((m) => m.i === el.id || m.j === el.id)
      membersToRemove.forEach((m) => store.removeMember(m.id))

      // Cascade: delete loads referencing this node (remove in reverse index order)
      // Re-read loads after member removals haven't changed loads, so we can filter
      const currentLoads = useModelStore.getState().loads
      const loadIndicesToRemove: number[] = []
      currentLoads.forEach((l, idx) => {
        if (l.type === 'point' && l.node === el.id) {
          loadIndicesToRemove.push(idx)
        }
      })
      // Remove in reverse order so indices stay valid
      for (let i = loadIndicesToRemove.length - 1; i >= 0; i--) {
        useModelStore.getState().removeLoad(loadIndicesToRemove[i])
      }

      // Delete the node
      useModelStore.getState().removeNode(el.id)
    } else if (el.type === 'member') {
      store.removeMember(el.id)
    } else if (el.type === 'plate') {
      store.removePlate(el.id)
    }
  }

  clearSelection()
}
