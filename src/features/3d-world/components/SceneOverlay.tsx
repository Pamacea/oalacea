// SceneOverlay - Overlay qui affiche le contenu des pages au-dessus de la scène 3D
'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlayStore } from '@/features/3d-world/store';
import { sanitizeHtml } from '@/lib/sanitize';

export function SceneOverlay() {
  const { isOpen, content, title, closeOverlay } = useOverlayStore();

  const safeContent = sanitizeHtml(content || '');

  const handleClose = () => {
    closeOverlay();
  };

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-imperium-black-deep/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(74,79,82,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(74,79,82,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl h-[80vh] bg-imperium-black rounded-none border-2 border-imperium-crimson shadow-[8px_8px_0_rgba(154,17,21,0.4)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-imperium-crimson" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-imperium-crimson" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-imperium-crimson" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-imperium-crimson" />

            {/* Header avec titre et bouton fermer */}
            <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark px-6 py-4">
              <h2 className="font-display text-lg uppercase tracking-wider text-imperium-crimson">
                [{title || 'Content'}]
              </h2>
              <button
                onClick={handleClose}
                className="rounded-none p-2 border-2 border-imperium-steel-dark bg-imperium-iron text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenu de la page */}
            <div className="h-[calc(80vh-73px)] overflow-y-auto">
              <div
                className="p-6 prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-imperium-crimson prose-p:font-terminal prose-p:text-imperium-steel prose-a:text-imperium-gold prose-strong:text-imperium-bone prose-code:text-imperium-gold prose-pre:bg-imperium-black-deep prose-pre:border-2 prose-pre:border-imperium-steel-dark max-w-none"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
