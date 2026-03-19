import type { SupportType } from '../../types/model'

interface Support3DProps {
  position: [number, number, number]
  type: SupportType
}

/**
 * Simple 3D support symbols.
 * - pin: cone pointing down
 * - roller: cone + small sphere base
 * - fixed: flat box
 * - none: renders nothing
 */
export function Support3D({ position, type }: Support3DProps) {
  if (type === 'none') return null

  return (
    <group position={position}>
      {(type === 'pin' || type === 'roller') && (
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.18, 8]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
      )}
      {type === 'roller' && (
        <mesh position={[0, -0.26, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
      )}
      {type === 'fixed' && (
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.2]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
      )}
    </group>
  )
}
