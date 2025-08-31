import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Menu from './Components/Menu'
import AnimatedCursor from "react-animated-cursor";

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

export default function App() {
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

  return (
    <>
      <AnimatedCursor
          color="255, 255, 255"
          clickables={[
              ".model"
          ]}
          innerStyle={{mixBlendMode: 'exclusion'}}
          outerStyle={{mixBlendMode: 'exclusion'}}

      />
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <Scene onSwap={handleSwap} models={models} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <h1 className="idesign" style={{ color:'white', position: 'absolute', top: '70vh', margin: 0, fontFamily: 'monospace', fontSize: '.8em', letterSpacing: '0.04em', width: '100vw', textAlign: 'center', fontFamily: "AzeretMono" }}>
        i <ScrambleText key={labels[labelIndex].toUpperCase()} text={labels[labelIndex].toLowerCase()} duration={650} />
      </h1>
      <h1 className="myname" style={{ color:'white', position: 'absolute', top: '2vh', margin: 0, marginLeft: '3vw', fontFamily: 'monospace', letterSpacing: '0.04em', textAlign: 'center', fontFamily: "AzeretMono" }}>martin mccarthy</h1>
      <Scroll />
      <Menu  />
    </>
  )
}
