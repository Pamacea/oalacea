/**
 * BRUTAL EFFECTS - Effets violents, glitchés, dérangeants
 * VISIBLE, AGRESSIF, CONSTANT
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

/* ============================================
   GLITCH TEXT - Texte qui bugue CONSTAMMENT
   ============================================ */

export interface GlitchTextProps {
  children: string
  className?: string
  intensity?: "low" | "medium" | "severe"
  auto?: boolean // Animation automatique (pas besoin de hover)
}

export function GlitchText({ children, className, intensity = "medium", auto = false }: GlitchTextProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [glitchChars, setGlitchChars] = React.useState<string[]>([])
  const [shouldGlitch, setShouldGlitch] = React.useState(false)

  const intensityMap = {
    low: { x: 6, duration: 0.4, chance: 0.05 },
    medium: { x: 12, duration: 0.2, chance: 0.1 },
    severe: { x: 24, duration: 0.1, chance: 0.2 },
  }

  const config = intensityMap[intensity]
  const isActive = auto || isHovered

  // Glitch automatique aléatoire
  React.useEffect(() => {
    if (!auto) return

    const glitchInterval = setInterval(() => {
      if (Math.random() < config.chance) {
        setShouldGlitch(true)
        setTimeout(() => setShouldGlitch(false), 150)
      }
    }, 500)

    return () => clearInterval(glitchInterval)
  }, [auto, config.chance])

  // Générer des caractères glitch
  React.useEffect(() => {
    if (!isActive) {
      setGlitchChars([])
      return
    }

    const chars = "█▓▒░╔╗╚╝║▀▄■□●○◘◙♠♣♥♦☺☻♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼"
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newGlitch = Array.from({ length: Math.floor(Math.random() * 3) + 1 })
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join('')
        setGlitchChars([newGlitch])
        setTimeout(() => setGlitchChars([]), 50)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  const splitX = isActive ? config.x : 0

  return (
    <span
      className={cn("inline-block cursor-default relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red channel - VISIBLE OFFSET */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="absolute left-0 top-0 text-imperium-crimson pointer-events-none mix-blend-screen"
            aria-hidden="true"
            animate={{
              x: [0, -splitX, splitX * 0.5, -splitX * 0.3, 0],
              opacity: [0.8, 1, 0.6, 1, 0.8],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Cyan channel - VISIBLE OFFSET */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="absolute left-0 top-0 text-imperium-teal pointer-events-none mix-blend-screen"
            aria-hidden="true"
            animate={{
              x: [0, splitX, -splitX * 0.5, splitX * 0.3, 0],
              opacity: [0.8, 1, 0.6, 1, 0.8],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
              delay: 0.05,
            }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Glitch characters overlay */}
      {shouldGlitch && glitchChars.length > 0 && (
        <span className="absolute left-0 top-0 text-imperium-crimson font-bold animate-pulse">
          {glitchChars[0]}
        </span>
      )}

      {/* Main text */}
      <motion.span
        className={cn("relative z-10", isActive && "text-white")}
        animate={shouldGlitch ? {
          skewX: [-5, 5, -3, 3, 0],
          x: [-2, 2, -1, 1, 0],
        } : {}}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ============================================
   CHAOTIC OVERLAY - Overlay BRILLANT et visible
   ============================================ */

export interface ChaoticOverlayProps {
  className?: string
  type?: "noise" | "scanlines" | "grunge" | "all"
  opacity?: number
}

export function ChaoticOverlay({ className, type = "all", opacity = 0.5 }: ChaoticOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-0", className)} style={{ opacity }}>
      {/* Noise texture - PLUS INTENSE */}
      {type === "noise" || type === "all" ? (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      ) : null}

      {/* Scanlines - PLUS VISIBLES */}
      {type === "scanlines" || type === "all" ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )`,
            backgroundSize: "100% 4px",
          }}
        />
      ) : null}

      {/* Animated scanline - LIGNE QUI DESCEND */}
      {type === "scanlines" || type === "all" ? (
        <motion.div
          className="absolute left-0 right-0 h-1 bg-imperium-crimson/30"
          animate={{
            y: ["0%", "100%"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            boxShadow: "0 0 20px rgba(154, 17, 21, 0.5)",
          }}
        />
      ) : null}

      {/* Vignette sombre */}
      {type === "grunge" || type === "all" ? (
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      ) : null}

      {/* Taches aléatoires */}
      {type === "grunge" || type === "all" ? (
        <>
          <div className="absolute top-10 left-10 w-32 h-32 bg-imperium-grime/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-imperium-earth/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-imperium-crimson/5 rounded-full blur-2xl" />
        </>
      ) : null}
    </div>
  )
}

/* ============================================
   FALLING FRAGMENTS - Particules qui tombent
   PLUS GROSSES, PLUS NOMBREUSES
   ============================================ */

export interface FallingFragmentsProps {
  className?: string
  color?: "crimson" | "gold" | "teal" | "mixed"
  count?: number
  size?: "sm" | "md" | "lg"
}

const fragmentColors = {
  crimson: ["bg-imperium-crimson", "bg-imperium-crimson-bright"],
  gold: ["bg-imperium-gold", "bg-imperium-gold-bright"],
  teal: ["bg-imperium-teal"],
  mixed: [
    "bg-imperium-crimson",
    "bg-imperium-gold",
    "bg-imperium-teal",
    "bg-imperium-rust",
    "bg-white",
  ],
}

const sizeMap = {
  sm: { w: "w-1", h: "h-1" },
  md: { w: "w-2", h: "h-2" },
  lg: { w: "w-3", h: "h-3" },
}

export function FallingFragments({
  className,
  color = "mixed",
  count = 30,
  size = "md"
}: FallingFragmentsProps) {
  const colors = Array.isArray(fragmentColors[color])
    ? fragmentColors[color]
    : [fragmentColors[color]]

  const { w, h } = sizeMap[size]

  // Pre-generate random values using useMemo to avoid impure render
  const fragments = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      key: i,
      colorClass: colors[i % colors.length],
      duration: 2 + ((i * 7) % 100) / 25,
      delay: ((i * 11) % 100) / 33,
      xPos: ((i * 13) % 100),
      rotate: 180 + ((i * 17) % 180),
      x: (((i * 19) % 100) / 100) * 100 - 50,
      repeatDelay: ((i * 23) % 100) / 50,
    })),
  [count, colors]
  )

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {fragments.map(({ key, colorClass, duration, delay, xPos, rotate, x, repeatDelay }) => (
        <motion.div
          key={key}
          className={cn("absolute", w, h, colorClass)}
          style={{ left: `${xPos}%` }}
          animate={{
            y: [-20, window.innerHeight + 20],
            opacity: [0, 1, 1, 0],
            rotate: [0, rotate],
            x: [0, x],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            repeatDelay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

/* ============================================
   CORRUPTED TEXT - Text corruption VISIBLE
   ============================================ */

export interface CorruptedTextProps {
  data: string
  corruptStrings: string[]
  className?: string
  interval?: number
  glitchChance?: number // Probabilité de glitch (0-1)
}

export function CorruptedText({
  data,
  corruptStrings,
  className,
  interval = 800,
  glitchChance = 0.4
}: CorruptedTextProps) {
  const [displayText, setDisplayText] = React.useState(data)
  const [isGlitching, setIsGlitching] = React.useState(false)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      // Plus forte chance de corruption
      if (Math.random() < glitchChance) {
        setIsGlitching(true)
        const corrupted = corruptStrings[Math.floor(Math.random() * corruptStrings.length)]
        setDisplayText(corrupted)

        // Retour au texte normal
        setTimeout(() => {
          setDisplayText(data)
          setIsGlitching(false)
        }, 150)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [data, corruptStrings, interval, glitchChance])

  return (
    <motion.span
      className={cn("font-mono inline-block", className, isGlitching && "text-imperium-crimson")}
      animate={isGlitching ? {
        x: [-2, 2, -1, 1, 0],
        opacity: [1, 0.8, 1, 0.7, 1],
      } : {}}
      transition={{ duration: 0.1 }}
    >
      {displayText}
    </motion.span>
  )
}

/* ============================================
   RGB SPLIT - RGB split PERMANENT
   ============================================ */

export interface RGBSplitProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  always?: boolean // Toujours visible, pas juste au hover
}

export function RGBSplit({ children, className, intensity = 6, always = true }: RGBSplitProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const isActive = always || isHovered

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isActive && (
        <>
          {/* Red offset */}
          <motion.span
            className="absolute left-0 top-0 text-imperium-crimson opacity-90 pointer-events-none mix-blend-screen"
            aria-hidden="true"
            animate={{
              x: [-intensity, -intensity + 2, -intensity],
            }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
          >
            {children}
          </motion.span>

          {/* Cyan offset */}
          <motion.span
            className="absolute left-0 top-0 text-imperium-teal opacity-90 pointer-events-none mix-blend-screen"
            aria-hidden="true"
            animate={{
              x: [intensity, intensity + 2, intensity],
            }}
            transition={{ duration: 0.25, repeat: Infinity, repeatType: "reverse" }}
          >
            {children}
          </motion.span>
        </>
      )}

      {/* Main text */}
      <span className="relative">{children}</span>
    </span>
  )
}

/* ============================================
   STATIC NOISE - Noise animé en arrière-plan
   ============================================ */

export function StaticNoise({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      const w = canvas.width
      const h = canvas.height
      const idata = ctx.createImageData(w, h)
      const buffer32 = new Uint32Array(idata.data.buffer)
      const len = buffer32.length

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.1) {
          buffer32[i] = 0x10ffffff // Semi-transparent white
        }
      }

      ctx.putImageData(idata, 0, 0)
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-none opacity-20", className)}
      width={256}
      height={256}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

/* ============================================
   SCANLINE BEAM - Faisceau qui descend
   ============================================ */

export function ScanlineBeam({
  color = "imperium-crimson",
  duration = 4
}: {
  color?: string
  duration?: number
}) {
  return (
    <motion.div
      className={cn("absolute top-2 left-0 right-0 h-2", `bg-${color}`)}
      style={{
        background: `linear-gradient(to bottom, transparent, ${color === "imperium-crimson" ? "#9a1115" : color}, transparent)`,
        boxShadow: `0 0 30px ${color === "imperium-crimson" ? "rgba(154, 17, 21, 0.8)" : color}`,
      }}
      animate={{
        y: ["-5%", "105%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}
