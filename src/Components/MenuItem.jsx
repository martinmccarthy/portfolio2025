// MenuItem.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
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
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += 0.5 * dt })
  return (
    <group ref={group} scale={scale}>
      <primitive object={centered} />
    </group>
  )
}

const iconMap = {
  'c#': 'csharp', csharp: 'csharp', python: 'python', unity: 'unity', 'unreal engine': 'unreal',
  react: 'react', 'react three fiber': 'r3f', 'three.js': 'threejs', node: 'node', 'node.js': 'node',
  mongodb: 'mongodb', typescript: 'typescript', javascript: 'javascript',
}

const normalizeKey = k => String(k || '').toLowerCase().replace(/\s+/g, ' ').trim()

function MediaTile({ src, href, alt = '' }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rX = useTransform(my, [-0.5, 0.5], [10, -10])
  const rY = useTransform(mx, [-0.5, 0.5], [-10, 10])
  const tZ = useTransform(
    [mx, my],
    ([x, y]) => 12 * Math.max(Math.abs(x), Math.abs(y))
  )

  const onMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    mx.set(x)
    my.set(y)
  }

  const onLeave = () => {
    animate(mx, 0, { type: 'spring', stiffness: 260, damping: 20 })
    animate(my, 0, { type: 'spring', stiffness: 260, damping: 20 })
  }

  const inner = (
    <motion.div
      className="tile"
      style={{ rotateX: rX, rotateY: rY, translateZ: tZ }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.06, zIndex: 2, boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <img src={src} alt={alt} className="bwimg" draggable="false" />
    </motion.div>
  )

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="bwimgwrap">
      {inner}
    </a>
  ) : (
    inner
  )
}

export default function MenuItem({ name, desc, model, dir = 1, tech = [], media = [] }) {
  const cardVariants = {
    initial: d => ({ x: d > 0 ? 40 : -40, rotateY: d > 0 ? 10 : -10, opacity: 0 }),
    animate: { x: 0, rotateY: 0, opacity: 1, transition: { type: 'spring', mass: 1.1, stiffness: 220, damping: 28 } },
    exit: d => ({ x: d > 0 ? -30 : 30, rotateY: d > 0 ? -6 : 6, opacity: 0, transition: { duration: 0.25 } })
  }

  const techIcons = tech
    .map(t => iconMap[normalizeKey(t)])
    .filter(Boolean)
    .map((key, i) => (
      <motion.img
        key={`${key}-${i}`}
        src={`/icons/${key}.svg`}
        alt={key}
        width={64}
        height={64}
        className="techicon"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 20 }}
      />
    ))

  const normalizedMedia = (media || []).map(m => typeof m === 'string' ? { src: m } : m)

  return (
    <div className="menuitem" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', alignItems: 'stretch', height: '100%' }}>
      <motion.div
        custom={dir}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ background: 'white', padding: '2rem', transformStyle: 'preserve-3d', willChange: 'transform, opacity', display: 'grid', gridTemplateRows: 'auto auto auto auto', gap: '1rem' }}
      >
        <h1 className="menutitle">{name}</h1>
        <h2 className="desc">{desc}</h2>

        {normalizedMedia.length > 0 && (
  <div
    className="mediarow"
    style={{
      display: 'grid',
      gridAutoFlow: 'row',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 0,
      width: '100%',
      alignItems: 'stretch'
    }}
  >
    {normalizedMedia.map((m, i) => (
      <MediaTile key={i} src={m.src} href={m.href} alt={m.alt} />
    ))}
  </div>
)}

        {!!techIcons.length && (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {techIcons}
          </div>
        )}
      </motion.div>

      <div style={{ background: 'black', overflow: 'hidden', position: 'relative', height: '100%', isolation: 'isolate', contain: 'layout paint size' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%', transform: 'none', willChange: 'auto' }}>
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
