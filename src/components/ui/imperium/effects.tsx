'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Imperium Effects Components
 * Visual effects for the Imperium design system
 */

/**
 * GlitchText - Text with glitch animation on hover
 */
export interface GlitchTextProps {
  children: string
  className?: string
  intensity?: "low" | "medium" | "high" | "severe"
}

export function GlitchText({ children, className, intensity = "medium" }: GlitchTextProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const intensityMap = {
    low: { x: [-1, 1, -1, 0], duration: 0.4 },
    medium: { x: [-2, 2, -2, 2, -1, 0], duration: 0.3 },
    high: { x: [-4, 4, -4, 4, -2, 2, 0], duration: 0.2 },
    severe: { x: [-8, 8, -8, 8, -4, 4, -2, 2, 0], duration: 0.15 },
  }

  const config = intensityMap[intensity]

  return (
    <span
      className={cn("inline-block cursor-default", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.span
              className="absolute left-0 top-0 text-imperium-crimson"
              aria-hidden="true"
              animate={{ x: config.x as number[] }}
              transition={{ duration: config.duration, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            >
              {children}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 text-imperium-gold"
              aria-hidden="true"
              animate={{ x: (config.x as number[]).map(v => -v) }}
              transition={{ duration: config.duration, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            >
              {children}
            </motion.span>
          </>
        )}
      </AnimatePresence>
      <span className={cn(isHovered && "relative z-10")}>{children}</span>
    </span>
  )
}

/**
 * Scanlines - CRT scanline overlay effect
 */
export interface ScanlinesProps {
  className?: string
  intensity?: "subtle" | "medium" | "strong"
  color?: "crimson" | "green" | "blue"
}

const colorMap = {
  crimson: "rgba(220, 20, 60, 0.1)",
  green: "rgba(0, 255, 136, 0.1)",
  blue: "rgba(0, 136, 255, 0.1)",
}

const intensityMap = {
  subtle: { opacity: 0.1, size: "4px" },
  medium: { opacity: 0.2, size: "3px" },
  strong: { opacity: 0.3, size: "2px" },
}

export function Scanlines({ className, intensity = "medium", color = "crimson" }: ScanlinesProps) {
  const config = intensityMap[intensity]

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        opacity: config.opacity,
        backgroundImage: `
          linear-gradient(
            to bottom,
            transparent 50%,
            ${colorMap[color]} 50%
          )
        `,
        backgroundSize: `100% ${config.size}`,
      }}
    />
  )
}

/**
 * Noise - Static noise/grain overlay
 */
export interface NoiseProps {
  className?: string
  opacity?: number
}

export function Noise({ className, opacity = 0.05 }: NoiseProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

/**
 * TyranidVision - Hive Mind perception overlay effect
 * Simulates Tyranid sensory input with organic noise, biomass detection tint, and neural pulse
 */
export interface TyranidVisionProps {
  className?: string
  intensity?: "subtle" | "medium" | "full"
}

const tyranidIntensityMap = {
  subtle: {
    noiseOpacity: 0.04,
    tintOpacity: 0.06,
    pulseOpacity: 0.02,
    blur: 0,
  },
  medium: {
    noiseOpacity: 0.08,
    tintOpacity: 0.12,
    pulseOpacity: 0.04,
    blur: 0.3,
  },
  full: {
    noiseOpacity: 0.15,
    tintOpacity: 0.2,
    pulseOpacity: 0.08,
    blur: 0.6,
  },
}

export function TyranidVision({ className, intensity = "subtle" }: TyranidVisionProps) {
  const config = tyranidIntensityMap[intensity]
  const [pulsePhase, setPulsePhase] = React.useState(0)
  const [darknessPhase, setDarknessPhase] = React.useState(0)
  const [glitchActive, setGlitchActive] = React.useState(false)
  const [glitchOffset, setGlitchOffset] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 0.015) % 1)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDarknessPhase(d => (d + 0.008) % 1)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.03) {
        setGlitchActive(true)
        setGlitchOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 2,
        })
        setTimeout(() => setGlitchActive(false), 50 + Math.random() * 100)
      }
    }, 200)
    return () => clearInterval(glitchInterval)
  }, [])

  const pulseOpacity = config.pulseOpacity + Math.sin(pulsePhase * Math.PI * 2) * 0.02
  const darknessOpacity = 0.02 + Math.sin(darknessPhase * Math.PI * 2) * 0.015

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <div
        className="absolute inset-0"
        style={{
          opacity: darknessOpacity,
          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: config.tintOpacity,
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(80, 255, 120, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 70%, rgba(180, 80, 220, 0.12) 0%, transparent 40%),
            linear-gradient(180deg, rgba(40, 120, 40, 0.1) 0%, rgba(20, 70, 20, 0.15) 100%)
          `,
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [pulseOpacity * 0.5, pulseOpacity, pulseOpacity * 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(60, 200, 90, 0.1), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: config.noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='tyranidNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1.5 0 0 0  0 0 1 0 0  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23tyranidNoise)'/%3E%3C/svg%3E")`,
          mixBlendMode: "screen",
          transform: glitchActive ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)` : undefined,
        }}
      />
      {glitchActive && (
        <>
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.3,
              background: "rgba(100, 255, 150, 0.05)",
              mixBlendMode: "color-dodge",
              transform: `translate(${glitchOffset.x * 2}px, 0)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.2,
              background: "rgba(180, 80, 220, 0.05)",
              mixBlendMode: "color-burn",
              transform: `translate(${-glitchOffset.x}px, 0)`,
            }}
          />
        </>
      )}
      {config.blur > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${config.blur}px)`,
            WebkitBackdropFilter: `blur(${config.blur}px)`,
          }}
        />
      )}
    </div>
  )
}

/**
 * GlowBox - Container with glow effect
 */
export interface GlowBoxProps {
  children: React.ReactNode
  color?: "crimson" | "gold" | "maroon"
  intensity?: "subtle" | "medium" | "strong"
  className?: string
}

const glowColorMap = {
  crimson: "rgba(220, 20, 60,",
  gold: "rgba(255, 215, 0,",
  maroon: "rgba(102, 2, 60,",
}

const glowIntensityMap = {
  subtle: { spread: "10px", alpha: 0.3 },
  medium: { spread: "20px", alpha: 0.5 },
  strong: { spread: "30px", alpha: 0.7 },
}

export function GlowBox({ children, color = "crimson", intensity = "medium", className }: GlowBoxProps) {
  const glowConfig = glowIntensityMap[intensity]
  const glowColor = glowColorMap[color]

  return (
    <div
      className={cn("relative", className)}
      style={{
        boxShadow: `0 0 ${glowConfig.spread} ${glowColor}${glowConfig.alpha})`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * ChronoFlicker - Time-based flicker effect
 */
export interface ChronoFlickerProps {
  children: React.ReactNode
  className?: string
  speed?: "slow" | "medium" | "fast"
}

const speedMap = {
  slow: { duration: 4, delay: 0 },
  medium: { duration: 3, delay: 0.5 },
  fast: { duration: 2, delay: 1 },
}

export function ChronoFlicker({ children, className, speed = "medium" }: ChronoFlickerProps) {
  const config = speedMap[speed]

  return (
    <motion.div
      className={className}
      animate={{
        opacity: [1, 1, 1, 0.8, 1, 1, 1, 0.3, 1, 1, 1, 0.5, 1],
      }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        delay: config.delay,
        times: [0, 0.3, 0.35, 0.36, 0.37, 0.7, 0.71, 0.72, 0.73, 0.9, 0.91, 0.92, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * BorderGlow - Animated border glow effect
 */
export interface BorderGlowProps {
  children: React.ReactNode
  color?: "crimson" | "gold"
  className?: string
}

export function BorderGlow({ children, color = "crimson", className }: BorderGlowProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        boxShadow: `inset 0 0 10px ${glowColorMap[color]}0.3), 0 0 10px ${glowColorMap[color]}0.3)`,
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: `inset 0 0 20px ${glowColorMap[color]}0.5)`,
        }}
      />
      {children}
    </div>
  )
}
