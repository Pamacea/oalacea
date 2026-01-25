// SceneOverlay - Overlay qui affiche le contenu des pages au-dessus de la scène 3D
'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlayStore } from '@/store/3d-overlay-store';

export function SceneOverlay() {
  const { isOpen, content, title, closeOverlay } = useOverlayStore();

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl h-[80vh] bg-background/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec titre et bouton fermer */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={handleClose}
                className="rounded-md p-2 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenu de la page */}
            <div className="h-[calc(80vh-73px)] overflow-y-auto">
              <div
                className="p-6 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
