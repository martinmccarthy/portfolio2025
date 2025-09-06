import { useEffect } from 'react'
import './About.css'
import { ScrambleOnce } from './Scramble'

function About({ onExitTop }) {
  useEffect(() => {
    let lastTouchY = 0

    const trigger = (e) => {
      let isScrollingUp = false

      if (e.type === 'wheel') {
        isScrollingUp = e.deltaY < 0
      } else if (e.type === 'touchmove') {
        const touch = e.touches[0]
        isScrollingUp = touch.clientY > lastTouchY
        lastTouchY = touch.clientY
      }

      if (isScrollingUp) {
        e.preventDefault()
        window.scrollTo(0, 0)
        onExitTop?.()
      }
    }

    window.addEventListener('wheel', trigger, { passive: false })
    window.addEventListener(
      'touchstart',
      (e) => {
        lastTouchY = e.touches[0].clientY
      },
      { passive: false }
    )
    window.addEventListener('touchmove', trigger, { passive: false })

    return () => {
      window.removeEventListener('wheel', trigger)
      window.removeEventListener('touchmove', trigger)
    }
  }, [onExitTop])

  return (
    <div className="aboutpage">
      <div className="about-content">
        <h1>about me</h1>
        <p>
          <ScrambleOnce text="
          Hi, I'm Martin!
          I am a PhD student in Computer Science at the University of Central Florida, where
          I also completed both my Bachelor’s and Master’s degrees in Computer Science. Growing up in 
          Florida with an early passion for graphic design helped me fall in love with
          our local theme parks, where immersive experiences are designed with deep care and detail." />
        </p>
        <p>
          I've carried that passion into my current PhD research, where I utilize Virtual Reality
          to design collaborative work environments that enhance the development
          cycle of themed entertainment attractions. My research goal is to contribute to the design
          of themed experiences in ways that merge storytelling, technology, and creativity.
          
          
        </p>
        <p>
          I design and develop immersive experiences that bring ideas to life. My expertise
          spans virtual reality, augmented reality, artificial intelligence, and digital twin
          systems. I combine technical knowledge with creative direction to deliver solutions
          that are interactive, engaging, and built to inspire.
        </p>
        <p>
          Whether it's building a real time simulation, creating a branded experience, or
          developing a game, my focus is always on producing work that connects with people.
        </p>
      </div>
    </div>
  )
}

export default About
