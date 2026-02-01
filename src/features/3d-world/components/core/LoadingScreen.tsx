'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

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
    case 'complete': 'READY'
  }
}

export function LoadingScreen() {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(true)
  const [hintIndex, setHintIndex] = useState(0)
  const currentStep = getLoadingStep(progress)

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => setVisible(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [progress])

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
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative z-10 mb-12 px-6 py-3 font-display text-5xl uppercase tracking-[0.3em] text-imperium-bone border-2 border-imperium-crimson shadow-[8px_8px_0_rgba(154,17,21,0.4)]"
          >
            OALACEA
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '320px' }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative z-10 w-full max-w-[320px]"
          >
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-terminal text-imperium-crimson uppercase">{getStepLabel(currentStep)}</span>
              <span className="font-terminal text-imperium-steel">{Math.round(progress)}%</span>
            </div>

            {/* Brutal progress bar */}
            <div className="relative h-3 border-2 border-imperium-steel-dark bg-imperium-black p-0.5">
              <motion.div
                className="h-full bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                suppressHydrationWarning
              />
              {/* Glitch overlay on progress bar */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(154,17,21,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
            </div>

            {/* Step indicators */}
            <motion.div
              className="mt-2 flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {(['assets', 'world', 'character'] as const).map((step, idx) => {
                const isActive = currentStep === step
                const isPast = progress > (idx + 1) * 33
                return (
                  <motion.div
                    key={step}
                    className="h-1 flex-1 border-2 border-imperium-steel-dark"
                    initial={{ backgroundColor: 'rgba(28,28,28,1)' }}
                    animate={{
                      backgroundColor: isPast ? '#5a0a0a' : isActive ? '#9a1115' : '#1c1c1c',
                      borderColor: isPast || isActive ? '#9a1115' : '#3a3f42',
                    }}
                    transition={{ duration: 0.3 }}
                    suppressHydrationWarning
                  />
                )
              })}
            </motion.div>
          </motion.div>

          {/* Hints */}
          <AnimatePresence mode="wait">
            <motion.p
              key={hintIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 mt-8 font-terminal text-sm text-imperium-steel max-w-xs text-center border-l-2 border-imperium-steel-dark pl-3"
            >
              {'>'} {hints[hintIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Decorative corner elements */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-imperium-steel-dark opacity-50" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-imperium-steel-dark opacity-50" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-imperium-steel-dark opacity-50" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-imperium-steel-dark opacity-50" />

          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-12 font-terminal text-imperium-steel-dark text-xs uppercase tracking-wider"
            >
              [ Entering the Imperium ]
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
