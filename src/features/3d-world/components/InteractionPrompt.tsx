'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useSession } from 'next-auth/react';
import { useCharacterStore } from '@/features/3d-world/store';
import { useModalStore } from '@/store/modal-store';
import { useWorldStore } from '@/features/3d-world/store';
import { useAdminToast } from '@/features/admin/components/AdminOnlyToast';

export function InteractionPrompt() {
  const openBlogListing = useModalStore((s) => s.openBlogListing);
  const openProjectListing = useModalStore((s) => s.openProjectListing);
  const openAboutListing = useModalStore((s) => s.openAboutListing);
  const openAdminListing = useModalStore((s) => s.openAdminListing);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;
  const { showToast } = useAdminToast() ?? { showToast: () => {} };

  const { canInteract, interactTarget } = useCharacterStore(
    useShallow((s) => ({
      canInteract: s.canInteract,
      interactTarget: s.interactTarget,
    }))
  );

  const handleInteract = () => {
    if (interactTarget?.targetWorld) {
      switchWorld(interactTarget.targetWorld);
    } else if (interactTarget?.route === '/blog') {
      openBlogListing();
    } else if (interactTarget?.route === '/portfolio') {
      openProjectListing();
    } else if (interactTarget?.route === '/about') {
      openAboutListing();
    } else if (interactTarget?.type === 'admin') {
      if (isAdmin) {
        openAdminListing();
      } else {
        showToast();
      }
    }
  };

  if (!canInteract || !interactTarget) return null;

  const isPortal = !!interactTarget.targetWorld;

  return (
    <AnimatePresence>
      {canInteract && interactTarget && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-4 rounded-none bg-imperium-black/90 px-5 py-2.5 backdrop-blur-md border-2 border-imperium-crimson shadow-[4px_4px_0_rgba(154,17,21,0.3)]">
            <kbd
              className="rounded-none bg-imperium-crimson border-2 border-imperium-crimson-dark px-3 py-1 text-sm text-imperium-bone font-terminal uppercase"
              aria-label="Press E to interact"
            >
              E
            </kbd>
            <span className="font-display text-sm text-imperium-bone uppercase tracking-wider">
              {isPortal ? `Enter ${interactTarget.name}` : interactTarget.name}
            </span>
            <button
              onClick={handleInteract}
              className="ml-2 rounded-none bg-imperium-steel p-2 hover:bg-imperium-steel-dark border-2 border-imperium-steel-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-imperium-crimson"
              aria-label={`Interact with ${interactTarget.name}`}
              role="button"
            >
              <svg className="w-4 h-4 text-imperium-bone" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
