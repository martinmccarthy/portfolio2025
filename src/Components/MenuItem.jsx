// MenuItem.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { animate, motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
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

function MenuItemPreview({ preview, mouse }) {
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const computeDims = useCallback((nw, nh) => {
    const maxW = Math.min(window.innerWidth * 0.82, 1200)
    const maxH = Math.min(window.innerHeight * 0.82, 900)
    const k = Math.min(maxW / nw, maxH / nh, 1)
    const w = Math.round(nw * k)
    const h = Math.round(nh * k)
    setDims({ w, h })
  }, [])
  useLayoutEffect(() => {
    if (!preview) return
    const img = new Image()
    img.onload = () => computeDims(img.naturalWidth, img.naturalHeight)
    img.src = preview.src
  }, [preview, computeDims])
  useEffect(() => {
    const onResize = () => {
      if (!preview) return
      const img = new Image()
      img.onload = () => computeDims(img.naturalWidth, img.naturalHeight)
      img.src = preview.src
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [preview, computeDims])
  const margin = 16
  const clampX = Math.min(Math.max(mouse.x, margin + dims.w / 2), window.innerWidth - margin - dims.w / 2)
  const clampY = Math.min(Math.max(mouse.y, margin + dims.h / 2), window.innerHeight - margin - dims.h / 2)

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          key="mi-preview"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: 'tween', duration: 0.15 }}
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
        >
          <motion.div
            initial={false}
            animate={{ x: clampX, y: clampY }}
            transition={{ type: 'tween', duration: 0.08 }}
            style={{
              position: 'absolute',
              translateX: '-50%',
              translateY: '-50%',
              width: `${dims.w}px`,
              height: `${dims.h}px`,
              borderRadius: 14,
              background: 'rgba(20,20,20,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              backdropFilter: 'blur(2px)'
            }}
          >
            <motion.img
              key={preview.src}
              src={preview.src}
              alt=""
              initial={{ opacity: 0.001, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.18 }}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MediaTile({ src, href, alt = '', setPreview, setMouse }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rX = useTransform(my, [-0.5, 0.5], [10, -10])
  const rY = useTransform(mx, [-0.5, 0.5], [-10, 10])
  const tZ = useTransform([mx, my], ([x, y]) => 12 * Math.max(Math.abs(x), Math.abs(y)))
  const onMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    mx.set(x)
    my.set(y)
    setMouse({ x: e.clientX, y: e.clientY })
  }
  const onEnter = () => setPreview({ src })
  const onLeave = () => {
    animate(mx, 0, { type: 'spring', stiffness: 260, damping: 20 })
    animate(my, 0, { type: 'spring', stiffness: 260, damping: 20 })
    setPreview(null)
  }
  const imgEl = (
    <motion.img
      src={src}
      alt={alt}
      draggable="false"
      initial={{ filter: 'grayscale(1) contrast(1) saturate(1)' }}
      whileHover={{ filter: 'grayscale(0) contrast(1.02) saturate(1.08)' }}
      transition={{ duration: 0.2 }}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
  const inner = (
    <motion.div
      className="tile"
      style={{ rotateX: rX, rotateY: rY, translateZ: tZ, borderRadius: 12, overflow: 'hidden' }}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.06, zIndex: 2, boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {imgEl}
    </motion.div>
  )
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="bwimgwrap" style={{ borderRadius: 12, overflow: 'hidden' }}>
      {inner}
    </a>
  ) : inner
}

export default function MenuItem({ name, desc, model, dir = 1, tech = [], media = [] }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 800px)')
    const h = e => setIsMobile(e.matches)
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [])

  const [preview, setPreview] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

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
        width={56}
        height={56}
        className="techicon"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 * i, type: 'spring', stiffness: 260, damping: 20 }}
      />
    ))

  const normalizedMedia = (media || []).map(m => typeof m === 'string' ? { src: m } : m)

  return (
    <>
      <div className="menuitem">
        <motion.div
          className="card"
          custom={dir}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <h1 className="menutitle">{name}</h1>
          <h2 className="desc">{desc}</h2>

          {!isMobile && normalizedMedia.length > 0 && (
            <div className="mediarow">
              {normalizedMedia.map((m, i) => (
                <MediaTile key={i} src={m.src} href={m.href} alt={m.alt} setPreview={setPreview} setMouse={setMouse} />
              ))}
            </div>
          )}

          {!!techIcons.length && (
            <div className="techrow">
              {techIcons}
            </div>
          )}
        </motion.div>

        <div className="canvaswrap">
          <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <Suspense fallback={null}>
              <WireModel src={model?.src} scale={model?.scale ?? 1} y={model?.y ?? 0} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      </div>

      {!isMobile && <MenuItemPreview preview={preview} mouse={mouse} />}
    </>
  )
}
