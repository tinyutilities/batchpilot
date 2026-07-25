'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function Logo({ size = 32, showText = true, className }: LogoProps) {
  return (
    <motion.div
      className={cn('flex items-center gap-2.5 select-none', className)}
      whileHover="hover"
      initial="rest"
      animate="rest"
      role="img"
      aria-label="BatchPilot logo"
    >
      <motion.img
        src="/brand/mascot.png"
        alt=""
        width={size}
        height={size}
        variants={{
          rest: { rotate: 0, scale: 1 },
          hover: { rotate: -6, scale: 1.06 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{ width: size, height: size }}
        className="shrink-0 object-contain"
      />

      {showText && (
        <motion.span
          variants={{
            rest: { opacity: 1, x: 0 },
            hover: { x: 1 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'font-semibold tracking-tight',
            'text-gray-900 dark:text-white'
          )}
          style={{ fontSize: Math.max(14, Math.round(size * 0.5)) }}
        >
          BatchPilot
        </motion.span>
      )}
    </motion.div>
  )
}