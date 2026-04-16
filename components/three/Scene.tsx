'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.04
    ref.current.rotation.y += delta * 0.06
  })
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#00c896" size={0.035} sizeAttenuation depthWrite={false} opacity={0.7} />
    </Points>
  )
}

function FloatingRing({ position, rotation, scale }: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.3
    ref.current.rotation.z += delta * 0.15
  })
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[1, 0.015, 16, 80]} />
      <meshBasicMaterial color="#00c896" transparent opacity={0.25} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ position: 'fixed', inset: 0, zIndex: 0 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <ParticleField />
      <FloatingRing position={[-3, 1, -2]}  rotation={[0.5, 0.3, 0]}   scale={2.2} />
      <FloatingRing position={[3, -1, -3]}  rotation={[0.2, 0.8, 0.4]} scale={3}   />
      <FloatingRing position={[0,  2, -4]}  rotation={[1,   0.2, 0.6]} scale={1.6} />
    </Canvas>
  )
}
