import React from 'react'
import { motion } from 'framer-motion'

export default function MenuButton({
  isOpen = false,
  width = 24,
  height = 24,
  strokeWidth = 1.8,
  active = 'home', // <- new prop to know which section
  transition = { type: 'tween', duration: 0.18 },
  lineProps = {},
  ...props
}) {
  const variant = isOpen ? 'opened' : 'closed'

  const top = {
    closed: { rotate: 0, translateY: 0 },
    opened: { rotate: 45, translateY: 2 },
  }
  const center = {
    closed: { opacity: 1 },
    opened: { opacity: 0 },
  }
  const bottom = {
    closed: { rotate: 0, translateY: 0 },
    opened: { rotate: -45, translateY: -2 },
  }

  // pick stroke color based on active section
  const color = active === 'menu' ? '#000' : '#fff'

  const lp = {
    stroke: color,
    strokeWidth,
    vectorEffect: 'non-scaling-stroke',
    initial: 'closed',
    animate: variant,
    transition,
    strokeLinecap: 'round',
    ...lineProps,
  }

  const unitHeight = 6
  const unitWidth = (unitHeight * width) / height

  return (
    <motion.svg
      viewBox={`0 0 ${unitWidth} ${unitHeight}`}
      overflow="visible"
      preserveAspectRatio="none"
      width={width}
      height={height}
      style={{ mixBlendMode: 'difference' }}
      {...props}
    >
      <motion.line x1="0" x2={unitWidth} y1="1" y2="1" variants={top} {...lp} />
      <motion.line x1="0" x2={unitWidth} y1="3" y2="3" variants={center} {...lp} />
      <motion.line x1="0" x2={unitWidth} y1="5" y2="5" variants={bottom} {...lp} />
    </motion.svg>
  )
}
