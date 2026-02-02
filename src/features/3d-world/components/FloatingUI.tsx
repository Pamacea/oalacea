'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModalStore } from '@/store/modal-store'
import { useLoadingStore } from '@/features/3d-world/store/loading-store'
import { AdminButton } from './AdminButton'
import { ControlsPanel } from './ControlsPanel'
import {
  BlogListingModal,
  ProjectListingModal,
  AboutListingModal,
  AdminListingModal,
} from './readers'

interface FloatingUIProps {
  cameraMode?: 'follow' | 'free'
  onToggleCamera?: () => void
}

export function FloatingUI({ cameraMode = 'follow', onToggleCamera }: FloatingUIProps) {
  const { isOpen, type, close } = useModalStore()
  const isLoading = useLoadingStore((s) => s.isLoading)

  // Debug: log modal state changes
  useEffect(() => {
    console.log('[FloatingUI] Modal state changed - isOpen:', isOpen, 'type:', type)
  }, [isOpen, type])

  // Global Escape handler for all modals
  useEffect(() => {
    console.log('[FloatingUI] Registering ESCAPE listener - close function type:', typeof close)

    const handleEscape = (e: KeyboardEvent) => {
      // Check state dynamically to avoid closure stale values
      const isModalOpen = useModalStore.getState().isOpen
      console.log('[FloatingUI] ANY key event - key:', e.key, 'code:', e.code, 'isModalOpen:', isModalOpen, 'eventPhase:', e.eventPhase)

      if (e.key === 'Escape' && isModalOpen) {
        console.log('[FloatingUI] ✓✓✓✓ ESCAPE DETECTED AND CLOSING')
        e.preventDefault()
        e.stopPropagation()
        close()
      }
    }
    // Use capture phase to ensure we catch Escape before other handlers
    window.addEventListener('keydown', handleEscape, true)
    return () => {
      console.log('[FloatingUI] Removing ESCAPE listener')
      window.removeEventListener('keydown', handleEscape, true)
    }
  }, [])

  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 200)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const showCameraButton = onToggleCamera !== undefined

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-imperium-crimson focus:text-imperium-bone focus:p-4 focus:rounded-none focus:font-semibold focus:border-2 focus:border-imperium-crimson-bright"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('scene-container')?.focus()
        }}
      >
        Skip to main content
      </a>

      {/* Floating Navigation - Bottom Left */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-[60]"
          >
            <div
              className={`relative bg-imperium-black-raise border-2 ${
                glitchActive ? 'border-imperium-crimson' : 'border-imperium-steel-dark'
              } rounded-none overflow-hidden`}
              style={{
                boxShadow: glitchActive
                  ? '0 0 20px rgba(154,17,21,0.3), inset 0 0 10px rgba(154,17,21,0.1)'
                  : '0 0 10px rgba(0,0,0,0.5), inset 0 0 5px rgba(212,175,55,0.05)',
              }}
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-imperium-crimson via-imperium-gold to-imperium-teal"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 200%' }}
                />
              </div>

              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="h-0.5 bg-imperium-crimson/30"
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-crimson" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-imperium-crimson" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-imperium-crimson" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-imperium-crimson" />

              {/* Buttons inside the floating nav - same height as FloatingNav */}
              <div className="relative z-10 flex items-center gap-1 px-2 py-2">
                {showCameraButton && (
                  <motion.div className="relative group" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <ControlsPanel cameraMode={cameraMode} onToggleCamera={onToggleCamera} />
                  </motion.div>
                )}
                <motion.div className="relative group" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <AdminButton />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && type === 'blog-listing' && <BlogListingModal />}
      {isOpen && type === 'project-listing' && <ProjectListingModal />}
      {isOpen && type === 'about-listing' && <AboutListingModal />}
      {isOpen && type === 'admin-listing' && <AdminListingModal />}
    </>
  )
}
