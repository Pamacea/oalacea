// TouchInteraction - Mobile touch interaction zones for 3D scene
// Right-side tap zone for E key interaction, long-press for context menu
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '@/features/3d-world/store';
import { useModalStore } from '@/store/modal-store';
import { useWorldStore } from '@/features/3d-world/store';

interface TouchInteractionProps {
  className?: string;
}

export function TouchInteraction({ className = '' }: TouchInteractionProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const canInteract = useCharacterStore((s) => s.canInteract);
  const interactTarget = useCharacterStore((s) => s.interactTarget);
  const isAdminModalOpen = useModalStore((s) => s.isOpen);

  const openBlogListing = useModalStore((s) => s.openBlogListing);
  const openProjectListing = useModalStore((s) => s.openProjectListing);
  const openAboutListing = useModalStore((s) => s.openAboutListing);
  const openAdminListing = useModalStore((s) => s.openAdminListing);
  const switchWorld = useWorldStore((s) => s.switchWorld);

  const isPortal = !!interactTarget?.targetWorld;
  const actionText = isPortal ? 'enter' : 'view';

  const handleInteraction = useCallback(() => {
    if (isAdminModalOpen) return;

    if (canInteract && interactTarget) {
      if (interactTarget.targetWorld) {
        switchWorld(interactTarget.targetWorld);
      } else if (interactTarget.route === '/blog') {
        openBlogListing();
      } else if (interactTarget.route === '/portfolio') {
        openProjectListing();
      } else if (interactTarget.route === '/about') {
        openAboutListing();
      } else if (interactTarget.type === 'admin') {
        openAdminListing();
      }

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [canInteract, interactTarget, openBlogListing, openProjectListing, openAboutListing, openAdminListing, switchWorld, isAdminModalOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAdminModalOpen) return;

    setIsPressed(true);
    const touch = e.touches[0];
    setPosition({ x: touch.clientX, y: touch.clientY });

    touchTimeoutRef.current = setTimeout(() => {
      setIsPressed(false);
      setShowContextMenu(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    }, 500);
  }, [isAdminModalOpen]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  }, []);

  const handleTap = useCallback(() => {
    if (!showContextMenu) {
      handleInteraction();
    }
    setShowContextMenu(false);
  }, [showContextMenu, handleInteraction]);

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={zoneRef}
        className={`
          fixed right-0 top-0 bottom-0 w-24 md:w-32 z-30
          touch-none select-none
          ${className}
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        aria-label="Interaction zone"
      >
        <AnimatePresence>
          {canInteract && interactTarget && !isAdminModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{
                  scale: isPressed ? 0.9 : 1,
                  opacity: isPressed ? 0.7 : 1,
                }}
                transition={{ duration: 0.1 }}
                className="relative"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-d4af37 bg-d4af37/20 backdrop-blur-sm flex items-center justify-center">
                  <motion.svg
                    className="w-6 h-6 md:w-8 md:h-8 text-d4af37"
                    animate={{ scale: isPressed ? 0.9 : 1 }}
                    transition={{ duration: 0.1 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </motion.svg>
                </div>

                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-d4af37/50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {isPressed && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full bg-d4af37/30"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <AnimatePresence>
            {canInteract && interactTarget && !isAdminModalOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10"
              >
                <p className="text-xs text-white/80 whitespace-nowrap">
                  {isPortal ? `Portal: ${interactTarget.name}` : interactTarget.name}
                </p>
                <p className="text-xs text-d4af70 font-medium mt-1">
                  Tap to {actionText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showContextMenu && canInteract && interactTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowContextMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: position.y - 100 }}
              animate={{ scale: 1, y: position.y }}
              exit={{ scale: 0.8, y: position.y - 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute right-4 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden min-w-48"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-medium text-white">
                  {interactTarget.name}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  {isPortal ? 'Portal' : interactTarget.type || 'Interaction'}
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={handleTap}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-d4af37/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-d4af37" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {isPortal ? 'Enter Portal' : 'View Content'}
                    </p>
                    <p className="text-xs text-white/60">
                      {isPortal ? `Travel to ${interactTarget.targetWorld === 'art' ? 'Art World' : 'Dev World'}` : 'Open in overlay'}
                    </p>
                  </div>
                </button>

                {interactTarget.route && (
                  <button
                    onClick={() => {
                      window.location.href = interactTarget.route;
                      setShowContextMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Open in New Tab</p>
                      <p className="text-xs text-white/60">Navigate directly</p>
                    </div>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowContextMenu(false)}
                className="w-full px-4 py-3 border-t border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
