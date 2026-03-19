import { useModelStore } from '../../store/modelStore'

let firstNodeId: number | null = null

export function handleMemberToolClick(nodeId: number) {
  if (firstNodeId === null) {
    firstNodeId = nodeId
  } else {
    if (firstNodeId !== nodeId) {
      const store = useModelStore.getState()
      const id = store.nextMemberId()
      store.addMember({
        id,
        i: firstNodeId,
        j: nodeId,
        section: 'default',
        material: 'default',
      })
    }
    firstNodeId = null
  }
}

export function resetMemberTool() {
  firstNodeId = null
}

export function getMemberToolState() {
  return { firstNodeId }
}
