import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface LoadArrow3DProps {
  /** World position of the node where the load is applied */
  origin: [number, number, number]
  /** Force vector [Fx, Fy, Fz] in structural coords (Z-up). Visualised only by direction. */
  force: [number, number, number]
  /** Scale of the arrow in scene units */
  scale?: number
}

/**
 * Renders a red arrow representing a point load.
 * The arrow shaft is drawn with a <Line>, and the head is a small cone.
 */
export function LoadArrow3D({ origin, force, scale = 1.0 }: LoadArrow3DProps) {
  const { shaftPoints, headPos, headRot } = useMemo(() => {
    const [fx, fy, fz] = force
    // Map from structural (Z-up) to Three.js (Y-up): X→X, Z→Y, -Y→Z
    const dir3 = new THREE.Vector3(fx, fz, -fy)
    const mag = dir3.length()
    if (mag === 0) return { shaftPoints: null, headPos: null, headRot: null }

    dir3.normalize()
    const arrowLen = scale * 0.8
    const tipPos = new THREE.Vector3(...origin).addScaledVector(dir3, arrowLen)

    // Shaft from origin to tip
    const shaft: [number, number, number][] = [
      origin,
      tipPos.toArray() as [number, number, number],
    ]

    // Cone head orientation
    const quat = new THREE.Quaternion()
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir3)
    const euler = new THREE.Euler().setFromQuaternion(quat)

    return {
      shaftPoints: shaft,
      headPos: tipPos.addScaledVector(dir3, 0.06).toArray() as [number, number, number],
      headRot: [euler.x, euler.y, euler.z] as [number, number, number],
    }
  }, [origin, force, scale])

  if (!shaftPoints || !headPos || !headRot) return null

  return (
    <group>
      <Line points={shaftPoints} color="#F44336" lineWidth={2} />
      <mesh position={headPos} rotation={headRot}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshStandardMaterial color="#F44336" />
      </mesh>
    </group>
  )
}
