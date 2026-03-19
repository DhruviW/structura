import { useModelStore } from '../../store/modelStore'
import { useUiStore } from '../../store/uiStore'

export function handleMemberToolClick(nodeId: number) {
  const ui = useUiStore.getState()
  const firstId = ui.previewState.memberFirstNodeId
  if (firstId === null) {
    ui.setPreviewMemberFirstNode(nodeId)
    ui.setStatusText('Click second node to complete member')
  } else {
    if (firstId !== nodeId) {
      const store = useModelStore.getState()
      const id = store.nextMemberId()
      store.addMember({ id, i: firstId, j: nodeId, section: 'default', material: 'default' })
    }
    ui.setPreviewMemberFirstNode(null)
    ui.setStatusText('')
  }
}

export function resetMemberTool() {
  const ui = useUiStore.getState()
  ui.setPreviewMemberFirstNode(null)
  ui.setStatusText('')
}

export function getMemberToolState() {
  return { firstNodeId: useUiStore.getState().previewState.memberFirstNodeId }
}
