// Menu.jsx
import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './Menu.css'
import MenuItem from './MenuItem'

function Menu({ onExitTop, onExitBottom }) {
  const [projectIndex, setProjectIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const accumRef = useRef(0)
  const lockRef = useRef(false)

  const MenuItems = [
    { name: 'Rollercoaster Builder VR',
      desc: 'A virtual reality based roller coaster design system which leverages a multi-display method for immersive development and real-time rider feedback. The system integrates a VR Table for interactive development and a Cave Automatic Virtual Environment (CAVE) for riding the coaster and offering real-time feedback.',
      publication: 'mmccarthyrollercoasters.pdf',
      model: { scale: .2, src: '/models/rollercoaster/scene.gltf' },
      tech: ['unity', 'c#'],
      media: [{ src: '/img/cave.jpg' }, { src: '/img/vrtable.jpg' }]
    },
    { name: 'Human Digital Twin', 
      desc: 'Metahuman AI instructor rendered onto a holographic display system which provides real-time guidance in training tasks. Designed in Unreal Engine connected to a Python backend running local large language models and computer vision to assess user performance.',
      model: { scale: 1.6, src: '/models/human/human.glb' }, tech: ['unreal engine', 'python'] ,
      media: [{ src: '/img/hdt3.jpg' }, { src: '/img/hdt1.jpg' }, { src: '/img/hdt2.jpg' }]
    },
    { name: 'Intergalactic Delivery Service', 
      desc: '2D Platformer game made in 24 hours for the VARLab Summer Game Jam. Play as a delivery man for the Unidentified Freight Operations to deliver an important package and save the world.', 
      model: { scale: 1, src: '/models/ufo/ufo.glb' }, 
      tech: ['unity', 'csharp'], 
      media: [{ src: '/img/ids1.png' }, { src: '/img/ids2.png' }, { src: '/img/ids3.png' }, { src: '/img/ids4.png' }]
    },
    
      { name: '"House of Nevermore" Dark Ride Experience', desc: 'Ride conceptualized and designed from blue sky to pitching the ride to Universal Studios Creative. Step into the mind of Edgar Allan Poe as the haunting horrors of his stories come to life through the House of Nevermore. Visualizations shown in Unity Engine, mockups created in Photoshop and Blender. Designed a Unity Editor tool to manipulate ride vehicle view points along the ride path.', model: { scale: .8, src: '/models/raven/RavenRideVehicleUNITY.glb' }, 
      tech: ['unity', 'c#'],
      media: [{ src: '/img/scene1.gif' }, { src: '/img/scene2.gif' }, { src: '/img/scene3.gif' }, { src: '/img/3.png' },  { src: '/img/4.png' },  { src: '/img/5.png' },  { src: '/img/ravenconceptimg.png' }]
    },
    { name: 'Crime Report Digital Twin', desc: 'A proof-of-concept use case for Urban Digital Twins by modeling crime response path planning at the University of Central Florida. Leverages open-source data in the Unity 3D game engine, Cesium, and OpenStreetMap platform to create a scalable framework for traffic simulations generated through the Simulation of Urban MObility package.', model: { scale: .1, src: '/models/city/scene.gltf' }, tech: ['unity', 'c#', 'python'],
media: [{ src: '/img/ucfdt.jpg' }, { src: '/img/cesium.png' }]
    }
  ]

  const clampIndex = (i) => {
    if (i < 0) return MenuItems.length - 1
    if (i >= MenuItems.length) return 0
    return i
  }

  const handleWheel = (e) => {
    if (lockRef.current) return
    accumRef.current += e.deltaY
    const threshold = 80
    if (Math.abs(accumRef.current) > threshold) {
      const dir = accumRef.current > 0 ? 1 : -1

      if (dir < 0 && projectIndex === 0) {
        accumRef.current = 0
        lockRef.current = true
        onExitTop?.()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => (lockRef.current = false), 650)
        return
      }

      if (dir > 0 && projectIndex === MenuItems.length - 1) {
        accumRef.current = 0
        lockRef.current = true
        onExitBottom?.()
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
              dir={direction}
              tech={MenuItems[projectIndex].tech}
              media={MenuItems[projectIndex].media}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Menu;
