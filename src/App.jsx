import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Menu from './Components/Menu'
import AnimatedCursor from "react-animated-cursor";
import About from './Components/About'
import HamburgerNav from './Components/HamburgerNav'
import Portfolio from './Components/Portfolio'

function WireModel({ src, y = 0, rotationRef, ...props }) {
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

  useFrame(() => {
    if (group.current) group.current.rotation.y = rotationRef.current
  })

  return (
    <group ref={group} {...props}>
      <primitive object={centered} />
    </group>
  )
}

function Scene({ onSwap, models }) {
  const rotation = useRef(0)
  const lastStep = useRef(0)
  const [index, setIndex] = useState(0)

  useFrame((_, dt) => {
    rotation.current += 0.5 * dt
    const step = Math.floor(rotation.current / (Math.PI / 2))
    if (step > lastStep.current) {
      const next = step % models.length
      setIndex(next)
      lastStep.current = step
      onSwap?.()
    }
  })

  const m = models[index]
  return (
    <Suspense fallback={null}>
      <WireModel className='model' src={m.src} scale={m.scale ?? 1} y={m.y ?? 0} rotationRef={rotation} />
    </Suspense>
  )
}

function ScrambleText({ text, duration = 700, fps = 60 }) {
  const [display, setDisplay] = useState(text)
  const glyphs = "█▓▒░#@$%&*+=-_/\\|<>~^?".split('')
  const rafRef = useRef(0)
  const startRef = useRef(0)

  useEffect(() => {
    const maxLen = text.length
    startRef.current = performance.now()

    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      const reveal = Math.floor(t * maxLen)
      const out = Array.from({ length: maxLen }, (_, i) =>
        i < reveal ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)]
      ).join('')
      setDisplay(out)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
      }
    }

    let last = 0
    const throttled = (now) => {
      if (now - last >= 1000 / fps) {
        last = now
        tick(now)
      }
      if (display !== text) rafRef.current = requestAnimationFrame(throttled)
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(throttled)

    return () => cancelAnimationFrame(rafRef.current)
  }, [text, duration, fps])

  return <span style={{ display: 'inline-block', mixBlendMode: 'difference' }}>{display}</span>
}

function BackgroundAudio({ src, volume = 0.4 }) {
  const audioRef = useRef(null)
  useEffect(() => {
    const a = new Audio()
    a.src = src
    // a.loop = true
    a.volume = volume
    audioRef.current = a
    const tryPlay = () => {
      a.play().catch(() => {})
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('keydown', tryPlay)
      window.removeEventListener('touchstart', tryPlay)
    }
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('keydown', tryPlay)
    window.addEventListener('touchstart', tryPlay)
    return () => {
      a.pause()
      a.src = ''
    }
  }, [src])
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])
  return null
}


function AudioControl({ volume, setVolume }) {
  const [open, setOpen] = useState(false)
  const prevVolRef = useRef(volume)
  const dragRef = useRef(false)
  const setFromEvent = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX ?? (e.touches?.[0]?.clientX || 0)) - rect.left
    const v = Math.min(1, Math.max(0, x / rect.width))
    setVolume(v)
  }

  
  return (
    <div className='button'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        position: 'fixed',
        top: '2vh',
        right: '1vw',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        mixBlendMode: 'difference',
      }}
    >
      <AnimatePresence>
        {open && (
        <motion.div
          initial={{ width: 0, opacity: 0, x: 10 }}
          animate={{ width: 140, opacity: 1, x: 0 }}
          exit={{ width: 0, opacity: 0, x: 10 }}
          transition={{ type: 'tween', duration: 0.2 }}
          style={{
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 9999,
            padding: '8px 10px',
            background: 'transparent'
          }}
        >
          <div
            onMouseDown={(e) => { dragRef.current = true; setFromEvent(e) }}
            onMouseMove={(e) => { if (dragRef.current) setFromEvent(e) }}
            onMouseUp={() => { dragRef.current = false }}
            onMouseLeave={() => { dragRef.current = false }}
            onTouchStart={(e) => { dragRef.current = true; setFromEvent(e) }}
            onTouchMove={setFromEvent}
            onTouchEnd={() => { dragRef.current = false }}
            style={{
              width: 120,
              height: 12,
              border: '1.5px solid white',
              borderRadius: 9999,
              position: 'relative',
              background: 'transparent',
              mixBlendMode: 'difference'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${Math.round(volume * 100)}%`,
                background: 'white',
                borderRadius: 9999,
                transition: 'width 120ms linear',
              }}
            />
          </div>
          </motion.div>
            )}
          </AnimatePresence>
          <div
      onClick={() => {
        if (volume > 0) {
          prevVolRef.current = volume
          setVolume(0)
        } else {
          setVolume(prevVolRef.current || 0.35)
        }
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: '9999px',
        border: '1.5px solid white',
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        mixBlendMode: 'difference'
      }}
    >
    {volume === 0 ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ mixBlendMode: 'difference' }}
      >
        <polygon points="11 4 6 8 2 8 2 16 6 16 11 20 11 4" />
        <line x1="16" y1="9" x2="21" y2="15" />
        <line x1="21" y1="9" x2="16" y2="15" />
      </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ mixBlendMode: 'exclusion' }}
        >
          <polygon points="11 4 6 8 2 8 2 16 6 16 11 20 11 4" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18 6a8 8 0 0 1 0 12" />
        </svg>)}
      </div>

    </div>
  )
}

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  function Scroll() {
    return (
      <div className="scrollmessage">
        <motion.h1
          style={{
            color: "white",
            position: "absolute",
            top: "90vh",
            margin: 0,
            fontFamily: "AzeretMono, monospace",
            fontSize: ".7em",
            letterSpacing: "0.04em",
            width: "100vw",
            textAlign: "center",
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          scroll
                    <svg
            width="20"
            height="20"
            viewBox="0 0 20 14"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.h1>


      </div>
    );
  }

  const models = [
    { src: '/models/quest2/scene.gltf', scale: 0.5 },
    { src: '/models/cave/cave.gltf', scale: 0.25 },
    { src: '/models/vrtable/vrtable.gltf', scale: 0.3 },
    { src: '/models/computer/scene.gltf', scale: 0.4 }

  ]

  const labels = ['Design Experiences', 'Create Solutions', 'Personalize Your Brand', 'Develop Games']
  const [labelIndex, setLabelIndex] = useState(0)
  const handleSwap = () => setLabelIndex(i => (i + 1) % labels.length)
  const [volume, setVolume] = useState(0.35)
  const [showMenu, setShowMenu] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)

  useEffect(() => {
    let lastTouchY = 0

    const trigger = (e) => {
      let isScrollingDown = false

      if (e.type === 'wheel') {
        isScrollingDown = e.deltaY > 0
      } else if (e.type === 'touchmove') {
        const touch = e.touches[0]
        isScrollingDown = touch.clientY < lastTouchY
        lastTouchY = touch.clientY
      }

      if (isScrollingDown && !showMenu) {
        e.preventDefault()
        window.scrollTo(0, 0)
        setShowMenu(true)
      }
    }

    window.addEventListener('wheel', trigger, { passive: false })
    window.addEventListener('touchstart', (e) => {
      lastTouchY = e.touches[0].clientY
    }, { passive: false })
    window.addEventListener('touchmove', trigger, { passive: false })

    return () => {
      window.removeEventListener('wheel', trigger)
      window.removeEventListener('touchmove', trigger)
    }
  }, [showMenu])
  

  const active = showAbout ? 'about' : (showPortfolio ? 'portfolio' : (showMenu ? 'menu' : 'home'))
  return (
    <>
      <BackgroundAudio src="/audio/bg4.mp3" volume={volume} />
      <AudioControl volume={volume} setVolume={setVolume} />
      <AnimatedCursor
          color="255, 255, 255"
          clickables={[
              ".button", ".icon"
          ]}
          innerStyle={{mixBlendMode: 'exclusion'}}
          outerStyle={{mixBlendMode: 'exclusion'}}

      />
      <HamburgerNav
        active={active}
        onHome={() => { setShowAbout(false); setShowMenu(false); setShowPortfolio(false); window.scrollTo(0, 0); }}
        onMenu={() => { setShowAbout(false); setShowPortfolio(false); setShowMenu(true);  window.scrollTo(0, 0); }}
        onPortfolio={() => { setShowAbout(false); setShowMenu(false); setShowPortfolio(true); window.scrollTo(0, 0); }}
        onAbout={() => { setShowMenu(false); setShowPortfolio(false); setShowAbout(true); window.scrollTo(0, 0); }}
      />

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <Scene onSwap={handleSwap} models={models} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <h1 className="idesign" style={{ color:'white', position: 'absolute', top: '70vh', margin: 0, fontSize: '.8em', letterSpacing: '0.04em', width: '100vw', textAlign: 'center', fontFamily: "AzeretMono" }}>
        i <ScrambleText key={labels[labelIndex].toUpperCase()} text={labels[labelIndex].toLowerCase()} duration={650} />
      </h1>
      <h1 className="myname" style={{ color:'white', position: 'absolute', top: 'max(10px, calc(env(safe-area-inset-top, 0px) + 8px))', margin: 0, marginLeft: '3vw', letterSpacing: '0.04em', textAlign: 'center', fontFamily: "AzeretMono" }}>martin mccarthy</h1>
      <Scroll />
  <AnimatePresence>
    {showMenu && (
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '100vh' }}
        exit={{ height: 0 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, overflow: 'hidden' }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            style={{
              width: '100%',
              height: `${100 / 8}vh`,
              background: 'rgba(255,255,255,0.9)',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            overflow: 'auto',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)'
          }}
        >
          <Menu
            onExitTop={() => { setShowMenu(false) }}
            onExitBottom={() => { setShowPortfolio(true) }}
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showPortfolio && (
      <motion.div
        initial={{ y: '100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100vh', opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 23,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          overflow: 'hidden'
        }}
      >
        <Portfolio
          onExitTop={() => { setShowPortfolio(false); setShowMenu(true) }}
          onExitBottom={() => { setShowPortfolio(false); setShowAbout(true) }}
        />
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showAbout && (
      <motion.div
        initial={{ clipPath: 'circle(0% at 90% 10%)', opacity: 0 }}
        animate={{ clipPath: 'circle(140% at 90% 10%)', opacity: 1 }}
        exit={{ clipPath: 'circle(0% at 90% 10%)', opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 25,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          overflow: 'hidden'
        }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.25 }}
          style={{ height: '100%' }}
        >
          <About onExitTop={() => { setShowAbout(false); setShowPortfolio(true) }} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
    </>
  )
}
