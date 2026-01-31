import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Imperium Loading Components
 * Warhammer 40K inspired loading states
 */

/**
 * ImperiumSpinner - Crimson/gold pulsing spinner
 */
export interface ImperiumSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { size: "16px", border: "2px" },
  md: { size: "24px", border: "3px" },
  lg: { size: "40px", border: "4px" },
}

export function ImperiumSpinner({ size = "md", className }: ImperiumSpinnerProps) {
  const config = sizeMap[size]

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: config.size, height: config.size }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-imperium-crimson/20 rounded-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-t-imperium-crimson border-r-transparent border-b-transparent border-l-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

/**
 * ImperiumSkeleton - Brutalist skeleton loader
 */
export interface ImperiumSkeletonProps {
  className?: string
  variant?: "text" | "circle" | "rect"
  width?: string
  height?: string
}

export function ImperiumSkeleton({
  className,
  variant = "rect",
  width,
  height,
}: ImperiumSkeletonProps) {
  const variantStyles = {
    text: "h-4 w-3/4",
    circle: "rounded-none", // Still square for brutalism
    rect: "",
  }

  return (
    <motion.div
      className={cn(
        "bg-imperium-iron/50",
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

/**
 * ImperiumProgressBar - Crimson progress bar
 */
export interface ImperiumProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  color?: "crimson" | "gold"
}

const colorMap = {
  crimson: "bg-imperium-crimson",
  gold: "bg-imperium-gold",
}

export function ImperiumProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  color = "crimson",
}: ImperiumProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-imperium-ivory uppercase tracking-wider mb-2">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-imperium-black-elevate border border-imperium-iron overflow-hidden">
        <motion.div
          className={cn("h-full", colorMap[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

/**
 * ImperiumLoadingScreen - Full screen loading overlay
 */
export interface ImperiumLoadingScreenProps {
  message?: string
  progress?: number
  showProgress?: boolean
  className?: string
}

export function ImperiumLoadingScreen({
  message = "INITIALIZING",
  progress,
  showProgress = false,
  className,
}: ImperiumLoadingScreenProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-imperium-black",
        className
      )}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[length:100%_4px] bg-[linear-gradient(to_bottom,transparent_50%,rgba(220,20,60,0.1)_50%)]" />

      {/* Crimson border glow */}
      <div className="absolute inset-4 border-2 border-imperium-crimson/30 pointer-events-none" />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glitchy title */}
        <motion.h1
          className="text-2xl font-bold text-imperium-crimson tracking-[0.3em] uppercase"
          animate={{
            opacity: [1, 1, 0.8, 1, 1, 1, 0.3, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            times: [0, 0.4, 0.41, 0.42, 0.7, 0.71, 0.72, 1],
          }}
        >
          {message}
        </motion.h1>

        {/* Spinner */}
        <ImperiumSpinner size="lg" />

        {/* Progress bar */}
        {showProgress && progress !== undefined && (
          <div className="w-64">
            <ImperiumProgressBar value={progress} showLabel color="crimson" />
          </div>
        )}
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-1 bg-imperium-crimson" />
      <div className="absolute top-8 left-8 w-1 h-16 bg-imperium-crimson" />
      <div className="absolute bottom-8 right-8 w-16 h-1 bg-imperium-crimson" />
      <div className="absolute bottom-8 right-8 w-1 h-16 bg-imperium-crimson" />
    </div>
  )
}
