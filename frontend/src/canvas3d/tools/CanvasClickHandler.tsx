import { useUiStore } from '../../store/uiStore'
import { handleNodeToolClick3D } from '../../canvas/tools/NodeTool'
import { handleMemberToolClick } from '../../canvas/tools/MemberTool'
import { findNearestNode3D } from './snapUtils3D'
import { useGroundPlaneClick } from './useRaycaster'

export function CanvasClickHandler() {
  const getWorldPos = useGroundPlaneClick()
  const activeMode = useUiStore((s) => s.activeMode)

  const handleClick = (e: any) => {
    e.stopPropagation()
    const world = getWorldPos(e)
    if (!world) return

    switch (activeMode) {
      case 'node':
        handleNodeToolClick3D(world.x, world.y, world.z)
        break
      case 'member': {
        const nearest = findNearestNode3D(world.x, world.y, world.z)
        if (nearest) handleMemberToolClick(nearest.id)
        break
      }
      case 'support': {
        const nearest = findNearestNode3D(world.x, world.y, world.z)
        if (nearest) useUiStore.getState().setPendingSupportNodeId(nearest.id)
        break
      }
      case 'load': {
        const nearest = findNearestNode3D(world.x, world.y, world.z)
        if (nearest) useUiStore.getState().setPendingLoadNodeId(nearest.id)
        break
      }
      default:
        break
    }
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.001, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
