// HamburgerNav.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MenuButton from './MenuButton'

export default function HamburgerNav({ active = 'home', onHome, onMenu, onAbout }) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const dropdownBg = active === 'menu' ? 'black' : 'white'
  const textColor   = active === 'menu' ? 'white' : 'black'
  const borderColor = active === 'menu' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'

  const Item = ({ label, onClick, isActive }) => (
    <motion.button
      className="button"
      onClick={() => { onClick?.(); setOpen(false) }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ type: 'tween', duration: 0.16 }}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        color: textColor,
        padding: '10px 12px',
        fontFamily: 'AzeretMono, monospace',
        fontSize: '0.85rem',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.85,
      }}
    >
      {isActive ? '• ' : ''}{label}
    </motion.button>
  )

  // Desktop: top-left (away from audio top-right)
  // Mobile: bottom-left (away from name top-left and audio top-right)
  const containerStyle = isMobile
    ? {
        position: 'fixed',
        bottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 8px))',
        left: '0.8vw',
        zIndex: 40,
        display: 'inline-block',
      }
    : {
        position: 'fixed',
        top: 'max(10px, calc(env(safe-area-inset-top, 0px) + 8px))',
        left: '0.8vw',
        zIndex: 40,
        display: 'inline-block',
      }

  // Dropdown anchoring:
  // - Desktop: to the right of the button
  // - Mobile: above the button
  const dropdownStyle = isMobile
    ? {
        position: 'absolute',
        bottom: 42,          // open upwards
        left: 0,
        minWidth: 180,
        borderRadius: 14,
        padding: 6,
        backgroundColor: dropdownBg,
        overflow: 'hidden',
        zIndex: 1,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      }
    : {
        position: 'absolute',
        top: 0,
        left: 42,            // open to the right
        minWidth: 180,
        borderRadius: 14,
        padding: 6,
        backgroundColor: dropdownBg,
        overflow: 'hidden',
        zIndex: 1,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      }

  return (
    <div style={containerStyle}>
      <button
        className="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Open navigation"
        style={{
          width: 38,
          height: 38,
          borderRadius: 9999,
          display: 'grid',
          placeItems: 'center',
          background: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2,
          border: `1px solid ${borderColor}`,
        }}
      >
        <MenuButton
          isOpen={open}
          width={22}
          height={22}
          strokeWidth={1.8}
          active={active}
          transition={{ type: 'tween', duration: 0.18 }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={isMobile ? { opacity: 0, scale: 0.96, y: 6 } : { opacity: 0, scale: 0.96, x: 6 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={isMobile ? { opacity: 0, scale: 0.96, y: 6 } : { opacity: 0, scale: 0.96, x: 6 }}
            transition={{ type: 'tween', duration: 0.18 }}
            style={dropdownStyle}
          >
            <Item label="Home"  onClick={onHome}  isActive={active === 'home'} />
            <Item label="Menu"  onClick={onMenu}  isActive={active === 'menu'} />
            <Item label="About" onClick={onAbout} isActive={active === 'about'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
