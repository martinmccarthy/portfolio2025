// MenuItem.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import './Menu.css'

function WireModel({ src, y = 0, scale = 1 }) {
  const { scene } = useGLTF(src)
  const group = useRef()

  const centered = useMemo(() => {
    const s = scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const c = box.getCenter(new THREE.Vector3())
    s.position.sub(c)
    s.position.y += y
    return s
  }, [scene, y])

  useEffect(() => {
    centered.traverse(o => {
      if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true })
    })
  }, [centered])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += 0.5 * dt
  })

  return (
    <group ref={group} scale={scale}>
      <primitive object={centered} />
    </group>
  )
}

export default function MenuItem({ name, desc, model, dir = 1 }) {
  const cardVariants = {
    initial: (d) => ({ x: d > 0 ? 40 : -40, rotateY: d > 0 ? 10 : -10, opacity: 0 }),
    animate: { x: 0, rotateY: 0, opacity: 1, transition: { type: 'spring', mass: 1.1, stiffness: 220, damping: 28 } },
    exit:    (d) => ({ x: d > 0 ? -30 : 30, rotateY: d > 0 ? -6 : 6, opacity: 0, transition: { duration: 0.25 } })
  }

  return (
    <div
      className="menuitem"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        alignItems: 'stretch',
        height: '100%',
      }}
    >
      <motion.div
        custom={dir}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          background: 'white',
          padding: '2rem',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
        
      >
        <h1 className="menutitle">{name}</h1>
        <h2 className="desc">{desc}</h2>
      </motion.div>

      {/* Keep the Canvas visually heavy but opt-out of parent transforms/filters */}
      <div
        style={{
          background: 'black',
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          isolation: 'isolate',
          contain: 'layout paint size'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{
            width: '100%',
            height: '100%',
            transform: 'none',
            willChange: 'auto'
          }}
        >
          <ambientLight intensity={0.6} />
          <Suspense fallback={null}>
            <WireModel src={model?.src} scale={model?.scale ?? 1} y={model?.y ?? 0} />
          </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
          
        </Canvas>
      </div>
    </div>
  )
}
