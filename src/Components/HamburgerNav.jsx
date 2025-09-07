import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MenuButton from './MenuButton'

export default function HamburgerNav({ active = 'home', onHome, onMenu, onAbout }) {
  const [open, setOpen] = useState(false)

  const dropdownBg = active === 'menu' ? 'black' : 'white'        // invert page bg
  const textColor   = active === 'menu' ? 'white' : 'black'
  const borderColor = active === 'menu' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const iconColor   = '#fff' // keep icon white for contrast against your scene

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

  return (
    <div
      style={{
        position: 'fixed',
        top: '2vh',
        left: '0.2vw',
        zIndex: 40,
        display: 'inline-block',
        // keep blend modes on the svg/lines/buttons themselves for cleaner layout
      }}
    >
      {/* Toggle button (stays put) */}
      <button
        className="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Open navigation"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          display: 'grid',
          placeItems: 'center',
          background: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2,
          border: 'none'
        }}
      >
<MenuButton
  isOpen={open}
  width={22}
  height={22}
  strokeWidth={1.8}
  active={active} // <- pass "home" | "menu" | "about"
  transition={{ type: 'tween', duration: 0.18 }}
/>      </button>

      {/* Dropdown (absolute so button doesn't shift) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 6, y: 0 }}
            animate={{ opacity: 1, scale: 1,    x: 6, y: 0 }}
            exit={{ opacity: 0, scale: 0.96,    x: 6, y: 0 }}
            transition={{ type: 'tween', duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 42,              // to the right of the button
              minWidth: 180,
              borderRadius: 14,
              padding: 6,
              backgroundColor: dropdownBg,
              overflow: 'hidden',
              zIndex: 1,
            }}
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
