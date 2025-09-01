// Menu.jsx
import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './Menu.css'
import MenuItem from './MenuItem'

function Menu({ onExitTop }) {

  const [projectIndex, setProjectIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const accumRef = useRef(0)
  const lockRef = useRef(false)

  const MenuItems = [
    { name: 'Rollercoaster Builder VR',
      desc: 'A virtual reality based roller coaster design system which leverages a multi-display method for immersive development and real-time rider feedback. The system integrates a VR Table for interactive development and a Cave Automatic Virtual Environment (CAVE) for riding the coaster and offering real-time feedback.',
      publication: 'mmccarthyrollercoasters.pdf',
      model: { scale: .2, src: '/models/rollercoaster/scene.gltf' }
    },
    { name: 'Human Digital Twin', desc: '', model: { scale: 1.6, src: '/models/human/human.glb' } },
    { name: 'Intergalactic Delivery Service', desc: '', model: { scale: 1, src: '/models/ufo/ufo.glb' } },
    { name: '"House of Nevermore" Dark Ride Experience', desc: '', model: { scale: 1, src: '/models/raven/scene.gltf' } },
    { name: 'Crime Report Digital Twin', desc: '', model: { scale: .02, src: '/models/city/scene.gltf' } }
  ]

  const clampIndex = (i) => {
    if (i < 0) return MenuItems.length - 1
    if (i >= MenuItems.length) return 0
    return i
  }

// Menu.jsx — replace handleWheel with this
const handleWheel = (e) => {
  if (lockRef.current) return
  accumRef.current += e.deltaY
  const threshold = 80
  if (Math.abs(accumRef.current) > threshold) {
    const dir = accumRef.current > 0 ? 1 : -1

    if (dir < 0 && projectIndex === 0) {
      accumRef.current = 0
      lockRef.current = true
      onExitTop?.()                 // tell parent to close the menu
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => (lockRef.current = false), 650)
      return
    }

    setDirection(dir)
    setProjectIndex((i) => clampIndex(i + dir))
    accumRef.current = 0
    lockRef.current = true
    setTimeout(() => (lockRef.current = false), 650)
  }
}


  // Keep the outer transition lightweight (no rotate/blur) so the <Canvas> inside stays crisp.
  const variants = {
    enter: (d) => ({ x: d > 0 ? '16vw' : '-16vw', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { type: 'spring', mass: 1.4, stiffness: 200, damping: 30 } },
    exit:  (d) => ({ x: d > 0 ? '-16vw' : '16vw', opacity: 0, transition: { duration: 0.32 } })
  }

  return (
    <div
      onWheel={handleWheel}
      style={{
        height: '100vh',
        width: '100vw',
        position: 'absolute',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <div className="menubox" style={{ position: 'relative', width: '90vw', height: '90vh' }}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={projectIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              width: '100%',
              height: '100%',
              willChange: 'transform, opacity',
            }}
          >
            <MenuItem
              name={MenuItems[projectIndex].name}
              desc={MenuItems[projectIndex].desc}
              model={MenuItems[projectIndex].model}
              dir={direction}     // pass direction so MenuItem can do its own 3D flair without touching the Canvas layer
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Menu
