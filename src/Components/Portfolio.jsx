import { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const works = [
  { src: '/img/adapt.png', title: '01' },
  { src: '/img/arms.png', title: '02' },
  { src: '/img/sorokin.jpg', title: '03' },
  { src: '/img/jason.png', title: '04' },
  { src: '/img/haunts.jpg', title: '05' },
  { src: '/img/frank.png', title: '06' },
  { src: '/img/7f.jpg', title: '07' },
  { src: '/img/kh1.png', title: '08' },
  { src: '/img/kh2.png', title: '10' },
]

export default function Portfolio({ onExitTop, onExitBottom }) {
  useEffect(() => {
    let lastTouchY = 0
    const trigger = (e) => {
      let dirDown = false
      if (e.type === 'wheel') dirDown = e.deltaY > 0
      else if (e.type === 'touchmove') {
        const t = e.touches[0]
        dirDown = t.clientY < lastTouchY
        lastTouchY = t.clientY
      }
      if (dirDown) onExitBottom?.()
      else onExitTop?.()
    }
    const setStart = (e) => { lastTouchY = e.touches[0].clientY }
    window.addEventListener('wheel', trigger, { passive: true })
    window.addEventListener('touchstart', setStart, { passive: true })
    window.addEventListener('touchmove', trigger, { passive: true })
    return () => {
      window.removeEventListener('wheel', trigger)
      window.removeEventListener('touchstart', setStart)
      window.removeEventListener('touchmove', trigger)
    }
  }, [onExitTop, onExitBottom])

  const [preview, setPreview] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const onMove = useCallback((e) => {
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    setMouse({ x, y })
  }, [])

  const margin = 16
  const clampX = Math.min(Math.max(mouse.x, margin + dims.w / 2), window.innerWidth - margin - dims.w / 2)
  const clampY = Math.min(Math.max(mouse.y, margin + dims.h / 2), window.innerHeight - margin - dims.h / 2)

  const computeDims = useCallback((natW, natH) => {
    const maxW = Math.min(window.innerWidth * 0.8, 1200)
    const maxH = Math.min(window.innerHeight * 0.8, 900)
    const minW = 320
    const minH = 240
    const k = Math.min(maxW / natW, maxH / natH, 1)
    let w = Math.max(natW * k, Math.min(minW, maxW))
    let h = Math.max(natH * k, Math.min(minH, maxH))
    const r = natW / natH
    if (w / h > r) w = h * r
    else h = w / r
    setDims({ w: Math.round(w), h: Math.round(h) })
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

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }} onMouseMove={onMove}>
      <div style={{ padding: '8vh 6vw' }}>
        <h1 style={{ fontFamily: 'AzeretMono, monospace', letterSpacing: '0.04em', margin: 0, fontSize: '1.2em' }}>
          art portfolio
        </h1>
        <p style={{ fontFamily: 'AzeretMono, monospace', letterSpacing: '0.02em', marginTop: 8 }}>
          selected works
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '18px',
            marginTop: '28px'
          }}
        >
          {works.map((w, i) => (
            <motion.div
              key={i}
              onHoverStart={() => setPreview(w)}
              onHoverEnd={() => setPreview(null)}
              whileHover={{ scale: 1.02, rotate: 0.25 }}
              transition={{ type: 'tween', duration: 0.18 }}
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#f4f4f4'
              }}
            >
              <motion.img
                src={w.src}
                alt={w.title}
                initial={false}
                animate={{ scale: 1.06 }}
                whileHover={{ scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.02) saturate(1.02)'
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
                  display: 'flex',
                  alignItems: 'end',
                  padding: 10,
                  color: 'white',
                  fontFamily: 'AzeretMono, monospace',
                  letterSpacing: '0.03em',
                  fontSize: '.8em'
                }}
              >
                {w.title}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.15 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 9999
            }}
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
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                background: 'rgba(20,20,20,0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
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
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
