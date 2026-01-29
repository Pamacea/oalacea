'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useCharacterStore } from '@/store/3d-character-store';
import { useOverlayStore } from '@/store/3d-overlay-store';
import { useWorldStore } from '@/store/3d-world-store';

export function InteractionPrompt() {
  const openOverlay = useOverlayStore((s) => s.openOverlay);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const { canInteract, interactTarget } = useCharacterStore(
    useShallow((s) => ({
      canInteract: s.canInteract,
      interactTarget: s.interactTarget,
    }))
  );

  const handleInteract = () => {
    if (interactTarget?.targetWorld) {
      switchWorld(interactTarget.targetWorld);
    } else if (interactTarget?.route && interactTarget?.name) {
      openOverlay(interactTarget.route, interactTarget.name);
    }
  };

  if (!canInteract || !interactTarget) return null;

  const isPortal = !!interactTarget.targetWorld;
  const actionText = isPortal ? 'enter' : 'view';

  return (
    <AnimatePresence>
      {canInteract && interactTarget && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-4 rounded-full bg-black/70 px-6 py-3 backdrop-blur-md border border-white/10">
            <span className="text-sm font-medium text-white">
              {isPortal ? `Portal to ${interactTarget.name}` : interactTarget.name}
            </span>
            <div className="flex items-center gap-2">
              <kbd
                className="rounded bg-white/20 px-2 py-1 text-xs text-white font-mono border border-white/10"
                aria-label="Press E to interact"
              >
                E
              </kbd>
              <span className="text-xs text-white/60">to {actionText}</span>
            </div>
            <button
              onClick={handleInteract}
              className="ml-2 rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={`${actionText} ${interactTarget.name}`}
              role="button"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
