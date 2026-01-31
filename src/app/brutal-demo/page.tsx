'use client'

/**
 * BRUTAL DEMO PAGE - VRAIMENT DEGUEULASSE
 * Glitch permanent, texture sale, particules glitchées
 */

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  BrutalButton,
  GlitchText,
  CorruptedText,
} from "@/components/ui/brutal"
import { Skull, Sword } from "lucide-react"

// COMPOSANT: TEXTE GLITCH BRUTAL - Plus lent, plus subtil
function BrutalGlitch({ children, className }: { children: string, className?: string }) {
  const [text, setText] = useState(children)
  const chars = "█▓▒░╔╗╚╝║▀▄■□●○◘◙♠♣♥♦"

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const glitched = children.split('').map((char, i) => {
          if (Math.random() > 0.85) {
            return chars[Math.floor(Math.random() * chars.length)]
          }
          return char
        }).join('')
        setText(glitched)
        setTimeout(() => setText(children), 100 + Math.random() * 200)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [children])

  return (
    <motion.span
      className={cn("inline-block", className)}
      animate={{
        x: [0, -1, 1, -0.5, 0.5, 0],
        skewX: [0, -1, 1, -0.5, 0.5, 0],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 2,
      }}
    >
      {text}
    </motion.span>
  )
}

// COMPOSANT: PARTICULE GLITCH - Plus lent
function GlitchParticle() {
  const chars = "█▓▒░■□"
  const [char, setChar] = useState(chars[0])
  const [pos, setPos] = useState({ x: Math.random() * 100, y: Math.random() * 100 })

  useEffect(() => {
    const interval = setInterval(() => {
      setChar(chars[Math.floor(Math.random() * chars.length)])
      setPos({
        x: Math.random() * 100,
        y: Math.random() * 100,
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.span
      className="absolute text-imperium-steel font-bold pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        fontSize: `${6 + Math.random() * 10}px`,
      }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        rotate: [0, 45, 90, 45, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 1,
        repeat: Infinity,
      }}
    >
      {char}
    </motion.span>
  )
}

// COMPOSANT: SCANLINES ANIMES - Plus lent, plus subtil
function BrutalScanlines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute inset-x-0 h-0.5 bg-imperium-crimson/50"
        animate={{ y: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ boxShadow: "0 0 10px rgba(122, 10, 10, 0.4)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.12) 2px,
            rgba(0,0,0,0.12) 4px
          )`,
        }}
      />
    </div>
  )
}

// COMPOSANT: NOISE CANVAS - Plus subtil
function NoiseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      const w = canvas.width
      const h = canvas.height
      const idata = ctx.createImageData(w, h)
      const buffer32 = new Uint32Array(idata.data.buffer)

      for (let i = 0; i < buffer32.length; i++) {
        if (Math.random() < 0.05) {
          buffer32[i] = 0x10ffffff
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
      className="fixed inset-0 w-full h-full pointer-events-none opacity-10 z-40"
      width={200}
      height={200}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// COMPOSANT: TEXTE CORROMPU - Plus lent
function AggressiveCorrupt({ text }: { text: string }) {
  const [display, setDisplay] = useState(text)

  const corruptStrings = [
    "C0RRUPT3D",
    "D@TA F@1L",
    "NULL_PTR",
    "ERR0R 0XDEAD",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setDisplay(corruptStrings[Math.floor(Math.random() * corruptStrings.length)])
        setTimeout(() => setDisplay(text), 150 + Math.random() * 200)
      }
    }, 1200)
    return () => clearInterval(interval)
  }, [text])

  return (
    <motion.span
      className="inline-block font-mono"
      animate={{
        x: [0, -1, 1, -0.5, 0.5, 0],
        opacity: [1, 0.7, 1, 0.8, 1],
      }}
      transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1 }}
    >
      {display}
    </motion.span>
  )
}

// COMPOSANT: BLOC GLITCH - Plus lent
function GlitchBlock({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      animate={{
        clipPath: [
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "polygon(3% 3%, 97% 2%, 98% 97%, 2% 98%)",
          "polygon(1% 4%, 99% 3%, 97% 98%, 2% 97%)",
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
    >
      {children}
      {/* Overlay subtil */}
      <motion.div
        className="absolute inset-0 bg-imperium-crimson/10 pointer-events-none"
        animate={{
          x: [0, -10, 10, -5, 5, 0],
          opacity: [0, 0.2, 0.1, 0.25, 0.15, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
      />
    </motion.div>
  )
}

export default function BrutalDemoPage() {
  const [chaos, setChaos] = useState(50)
  const particles = Array.from({ length: 12 })

  return (
    <main className="min-h-screen bg-imperium-black-deep text-imperium-metal relative overflow-x-hidden">
      {/* LAYERS D'EFFETS */}
      <BrutalScanlines />

      {/* PARTICULES GLITCH */}
      <div className="fixed inset-0 pointer-events-none z-30">
        {particles.map((_, i) => (
          <GlitchParticle key={i} />
        ))}
      </div>

      {/* OVERLAY SALE - Plus subtil */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-imperium-black/0 via-transparent to-imperium-black/30" />
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 space-y-12">

        {/* HERO - Animation lente */}
        <motion.div
          className="text-center space-y-8"
          animate={{
            scale: [1, 1.005, 0.995, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="relative">
            {/* Titre géant avec glitch */}
            <h1 className="text-7xl md:text-9xl font-display text-imperium-crimson tracking-tighter">
              <BrutalGlitch>IMPERIUM</BrutalGlitch>
            </h1>

            {/* Ombres RGB - Plus lentes */}
            <motion.span
              className="absolute left-0 top-0 text-7xl md:text-9xl font-display text-imperium-crimson opacity-50 -z-10"
              animate={{ x: [-4, 4, -2, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              IMPERIUM
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 text-7xl md:text-9xl font-display text-imperium-warp opacity-40 -z-10"
              animate={{ x: [4, -4, 2, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              IMPERIUM
            </motion.span>
          </div>

          {/* Sous-titre corrompu */}
          <div className="text-xl md:text-2xl font-terminal text-imperium-gold space-y-2">
            <AggressiveCorrupt text="Warhammer 40K Inspired Interface" />
            <AggressiveCorrupt text="Grimdark UI System v2.0" />
          </div>
        </motion.div>

        {/* BOUTONS GLITCH */}
        <div className="flex flex-wrap gap-6 justify-center">
          <GlitchBlock>
            <BrutalButton variant="crimson" size="xl" showGlitch>
              <Sword className="w-5 h-5" />
              JOIN THE CRUSADE
            </BrutalButton>
          </GlitchBlock>
          <GlitchBlock>
            <BrutalButton variant="brutal" size="xl" showGlitch>
              <Skull className="w-5 h-5" />
              FOR THE EMPEROR
            </BrutalButton>
          </GlitchBlock>
        </div>

        {/* SLIDER CHAOS */}
        <GlitchBlock className="w-full max-w-md">
          <div className="p-6 border-2 border-imperium-metal bg-imperium-charcoal/80 backdrop-blur">
            <label className="font-terminal text-xs uppercase text-imperium-crimson block mb-4">
              CHAOS LEVEL: {chaos}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={chaos}
              onChange={(e) => setChaos(Number(e.target.value))}
              className="w-full h-2 bg-imperium-metal appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9a1115 ${chaos}%, #4a4a4a ${chaos}%)`,
              }}
            />
          </div>
        </GlitchBlock>

        {/* SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {[
            { title: "CRIMSON", color: "border-imperium-crimson", text: "text-imperium-crimson" },
            { title: "GOLD", color: "border-imperium-gold", text: "text-imperium-gold" },
            { title: "WARP", color: "border-imperium-warp", text: "text-imperium-warp" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={cn(
                "p-8 border-2 bg-imperium-black/60 backdrop-blur",
                item.color
              )}
              animate={{
                y: [0, -1, 1, -0.5, 0.5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              >
                <h3 className={cn("font-display text-4xl mb-4", item.text)}>
                  <BrutalGlitch>{item.title}</BrutalGlitch>
                </h3>
                <p className="font-terminal text-sm text-imperium-steel">
                  {'>'} System nominal
                </p>
              </motion.div>
          ))}
        </div>

        {/* TEXT AREA GLITCH */}
        <GlitchBlock className="w-full max-w-2xl">
          <div className="p-8 border-2 border-imperium-crimson bg-imperium-black/80 backdrop-blur">
            <div className="font-terminal text-imperium-metal space-y-2">
              <p>{'>'} INITIALIZE EMPEROR_PROTOCOL...</p>
              <p>{'>'} <AggressiveCorrupt text="LOADING ASSETS..." /></p>
              <p>{'>'} <AggressiveCorrupt text="DECRYPTING DATA..." /></p>
              <p className="text-imperium-crimson animate-pulse">
                {'>'} IN THE GRIM DARKNESS...
              </p>
              <p className="text-imperium-gold">
                {'>'} THERE IS ONLY WAR
              </p>
            </div>
          </div>
        </GlitchBlock>

        {/* CRANE DECORATION - Plus lent */}
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="text-imperium-steel"
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.1, 1],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Skull className="w-8 h-8" />
            </motion.div>
          ))}
        </div>

      </div>

      {/* FOOTER GLITCH */}
      <footer className="relative z-10 py-12 border-t-2 border-imperium-metal bg-imperium-black/80">
        <div className="text-center space-y-4">
          <p className="font-display text-imperium-crimson text-2xl">
            <BrutalGlitch>THE EMPEROR PROTECTS</BrutalGlitch>
          </p>
          <p className="font-terminal text-xs text-imperium-metal-dark">
            <AggressiveCorrupt text="Grimdark UI System - Warhammer 40K" />
          </p>
        </div>
      </footer>
    </main>
  )
}
