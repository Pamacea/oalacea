'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Mail, FileText, FolderKanban, ExternalLink } from 'lucide-react';
import { useModalStore } from '@/store/modal-store';

export function AboutListingModal() {
  const { close } = useModalStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [close]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={close}
      />

      <motion.div
        key="modal"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-[51] w-[70vw] max-w-2xl h-[80vh] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
            <h2 className="text-lg font-semibold text-zinc-100">À propos</h2>
            <button
              onClick={close}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-white">Oalacea</h3>
              <p className="text-zinc-400">
                Portfolio & Blog créés avec Next.js 15, Three.js et Prisma.
              </p>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                Une expérience immersive 3D combinant créativité technique et design moderne.
              </p>
            </div>

            {/* Tech Stack */}
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-500 mb-3 flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Stack Technique
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'Three.js', 'Prisma', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'TanStack Query'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-400">Navigation</h4>
              <div className="space-y-2">
                <a
                  href="/blog"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                >
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>Blog</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-zinc-600" />
                </a>
                <a
                  href="/portfolio"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                >
                  <FolderKanban className="h-4 w-4 text-purple-500" />
                  <span>Portfolio</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-zinc-600" />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800">
              <a
                href="https://github.com/oalacea"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-all"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:oalacea@proton.me"
                className="p-3 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-all"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
            <span className="text-xs text-zinc-600">Version 1.0</span>
            <span className="text-xs text-zinc-600">ESC pour fermer</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
