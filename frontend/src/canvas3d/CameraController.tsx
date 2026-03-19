import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useUiStore } from '../store/uiStore'

export function CameraController() {
  const viewMode = useUiStore((s) => s.viewMode)
  const { camera, size } = useThree()

  useEffect(() => {
    switch (viewMode) {
      case '3d':
        // Perspective: reset to isometric-ish view
        camera.position.set(10, 10, 10)
        camera.lookAt(0, 0, 0)
        break
      case 'plan-xy':
        // Top-down: look along -Z
        camera.position.set(0, 0, 20)
        camera.lookAt(0, 0, 0)
        camera.up.set(0, 1, 0)
        break
      case 'elevation-xz':
        // Front: look along -Y
        camera.position.set(0, -20, 0)
        camera.lookAt(0, 0, 0)
        camera.up.set(0, 0, 1)
        break
      case 'elevation-yz':
        // Side: look along -X
        camera.position.set(-20, 0, 0)
        camera.lookAt(0, 0, 0)
        camera.up.set(0, 0, 1)
        break
    }
    camera.updateProjectionMatrix()
  }, [viewMode, camera, size])

  return <OrbitControls enableRotate={viewMode === '3d'} />
}
