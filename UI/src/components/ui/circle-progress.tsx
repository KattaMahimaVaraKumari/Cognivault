import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CircleProgressProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
  circleColor?: string
  progressColor?: string
  className?: string
  children?: React.ReactNode
  breathScale?: number // 1 to 1.15 for breathing rhythm animation
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  progress,
  size = 280,
  strokeWidth = 8,
  circleColor = '#ffdce4',
  progressColor = '#e0567b',
  className,
  children,
  breathScale = 1,
}) => {
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Synchronized breathing rhythm pulse circle in background */}
      <motion.div
        animate={{ scale: breathScale }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute inset-4 rounded-full bg-[#fff0f4] -z-10"
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={circleColor}
          strokeWidth={strokeWidth}
        />

        {/* Dynamic progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  )
}

export default CircleProgress
