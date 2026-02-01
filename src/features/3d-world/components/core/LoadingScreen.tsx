'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoadingStore } from '@/features/3d-world/store/loading-store'

const hints = [
  'Use Right Click to explore the world',
  'Press WASD for directional movement',
  'Hold Shift to sprint faster',
  'Press E to interact with objects',
  'Press ? anytime for help',
]

type LoadingStep = 'assets' | 'world' | 'character' | 'complete'

function getLoadingStep(progress: number): LoadingStep {
  if (progress < 30) return 'assets'
  if (progress < 60) return 'world'
  if (progress < 100) return 'character'
  return 'complete'
}

function getStepLabel(step: LoadingStep): string {
  switch (step) {
    case 'assets': return 'LOADING ASSETS'
    case 'world': return 'BUILDING WORLD'
    case 'character': return 'INITIALIZING CHARACTER'
    case 'complete': return 'READY'
    default: return 'LOADING'
  }
}

export function LoadingScreen() {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(true)
  const [hintIndex, setHintIndex] = useState(0)
  const currentStep = getLoadingStep(progress)
  const setLoading = useLoadingStore((s) => s.setLoading)

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setVisible(false)
        setLoading(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, setLoading])

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-imperium-black-deep"
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(74,79,82,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(74,79,82,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl uppercase tracking-[0.3em] text-imperium-bone relative z-10"
          >
            OALACEA
          </motion.h1>

          {/* Loading bar */}
          <div className="w-64 md:w-96 h-1 bg-imperium-steel-dark/30 mt-8 relative overflow-hidden">
            <motion.div
              className="h-full bg-imperium-crimson"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Status text */}
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-terminal text-sm text-imperium-steel mt-4 tracking-wider"
          >
            {getStepLabel(currentStep)}... {Math.round(progress)}%
          </motion.p>

          {/* Hints */}
          <motion.p
            key={hintIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="font-terminal text-xs text-imperium-steel-muted mt-8 max-w-md text-center px-4"
          >
            {hints[hintIndex]}
          </motion.p>

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-imperium-gold" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-imperium-gold" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-imperium-gold" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-imperium-gold" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
