'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ControlInfo {
  keys: string[]
  description: string
  category: 'movement' | 'interaction' | 'camera' | 'system'
}

const controls: ControlInfo[] = [
  { keys: ['Right Click'], description: 'Set destination and move', category: 'movement' },
  { keys: ['W', 'A', 'S', 'D'], description: 'Directional movement', category: 'movement' },
  { keys: ['Shift'], description: 'Sprint (hold while moving)', category: 'movement' },
  { keys: ['E'], description: 'Interact with nearby objects', category: 'interaction' },
  { keys: ['Space'], description: 'Toggle camera follow/free mode', category: 'camera' },
  { keys: ['?'], description: 'Open this help modal', category: 'system' },
  { keys: ['Escape'], description: 'Close modals and overlays', category: 'system' },
]

const categoryLabels = {
  movement: 'MOVEMENT',
  interaction: 'INTERACTION',
  camera: 'CAMERA',
  system: 'SYSTEM',
}

export function WorldNavigationHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-30 h-8 w-8 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 backdrop-blur-sm transition-colors flex items-center justify-center text-sm font-bold"
        aria-label="Open help (press ?)"
      >
        ?
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <div className="mx-4 rounded-lg bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h2 className="text-xl font-bold text-zinc-100">CONTROLS</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                    aria-label="Close help"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(categoryLabels).map(([category, label]) => {
                    const categoryControls = controls.filter(c => c.category === category)
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-xs font-semibold rounded px-2 py-1 inline-block bg-zinc-800 text-zinc-300">
                          {label}
                        </h3>
                        <div className="space-y-2 pl-2">
                          {categoryControls.map((control, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 py-1">
                              <div className="flex gap-1">
                                {control.keys.map((key, kIdx) => (
                                  <kbd
                                    key={kIdx}
                                    className="rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-200 font-mono border border-zinc-700"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                              <span className="text-sm text-zinc-500">{control.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Close (ESC)
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Also export as HelpModal for backward compatibility
export { WorldNavigationHelp as HelpModal }
