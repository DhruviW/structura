import type { SupportType, Restraints } from '../../types/model'
import { useModelStore } from '../../store/modelStore'

const supportRestraints: Record<SupportType, Restraints> = {
  pin: [1, 1, 0],
  roller: [0, 1, 0],
  fixed: [1, 1, 1],
  none: [0, 0, 0],
}

export function handleSupportToolClick(nodeId: number, supportType: SupportType) {
  const store = useModelStore.getState()
  store.updateNode(nodeId, { restraints: supportRestraints[supportType] })
}
