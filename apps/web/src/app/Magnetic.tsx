'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    // Check if touch device
    if (window.matchMedia('(pointer: coarse)').matches) return

    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current!.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.35, y: middleY * 0.35 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  const { x, y } = position

  return (
    <motion.div
      style={{ position: 'relative' }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: 'spring', damping: 15, stiffness: 150, mass: 0.1 }}
    >
      <div style={{ display: 'contents' }}>
        {children}
      </div>
    </motion.div>
  )
}
