import { useMemo } from 'react'
import * as THREE from 'three'

interface Member3DProps {
  start: [number, number, number]
  end: [number, number, number]
  id: number
  selected: boolean
  onClick?: () => void
}

export function Member3D({ start, end, id: _id, selected, onClick }: Member3DProps) {
  const { position, rotation, length } = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const mid = s.clone().add(e).multiplyScalar(0.5)
    const dir = e.clone().sub(s)
    const len = dir.length()
    dir.normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    const euler = new THREE.Euler().setFromQuaternion(quaternion)
    return {
      position: mid.toArray() as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length: len,
    }
  }, [start, end])

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, length, 8]} />
        <meshStandardMaterial color={selected ? '#2196F3' : '#555'} />
      </mesh>
    </group>
  )
}
