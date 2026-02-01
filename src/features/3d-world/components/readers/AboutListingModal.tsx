'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Mail, FileText, FolderKanban, ExternalLink, Shield, Cpu } from 'lucide-react';
import { useModalStore } from '@/store/modal-store';
import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

export function AboutListingModal() {
  const { close } = useModalStore();
  const { playHover, playClick } = useUISound();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [close]);

  return (
    <AnimatePresence>
      {/* Backdrop with chaotic overlay */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-imperium-black-deep/90 backdrop-blur-sm"
        onClick={close}
      >
        <ChaoticOverlay type="all" opacity={0.25} />
        <ScanlineBeam color="#9a1115" duration={5} />
      </motion.div>

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ scale: 0.9, opacity: 0, rotateX: 10, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotateX: -10, y: 50 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative z-[51] w-[90vw] max-w-2xl h-[85vh] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-imperium-black-raise border-2 border-imperium-crimson rounded-none shadow-[0_0_60px_rgba(154,17,21,0.4),_8px_8px_0_rgba(154,17,21,0.2)] overflow-hidden flex flex-col h-full">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-10 opacity-5 pointer-events-none">
            <Shield className="w-24 h-24 text-imperium-crimson" />
          </div>
          <div className="absolute bottom-1/4 right-10 opacity-5 pointer-events-none">
            <Cpu className="w-24 h-24 text-imperium-crimson" />
          </div>

          {/* Header with brutalist style */}
          <div className="relative border-b-2 border-imperium-crimson bg-imperium-black-deep/80 px-6 py-5 shrink-0">
            {/* Scanlines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.2)_1px,rgba(154,17,21,0.2)_2px)]" />
            </div>

            {/* Top accent line */}
            <div className="absolute left-0 top-0 right-0 h-1 bg-imperium-crimson">
              <motion.div
                className="h-full bg-imperium-gold"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ width: '15%' }}
              />
            </div>

            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-widest text-imperium-bone">
                  <GlitchText intensity="severe" auto>
                    Data Slate
                  </GlitchText>
                </h2>
                <p className="font-terminal text-sm text-imperium-steel mt-1">
                  {'>'} Imperial Personnel Record
                </p>
              </div>

              <motion.button
                onClick={close}
                onMouseEnter={playHover}
                className="group p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
              >
                <motion.div
                  className="absolute inset-0 bg-imperium-crimson/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                />
                <X className="h-6 w-6 relative z-10 group-hover:rotate-90 transition-transform duration-200" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto">
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="p-6 space-y-6 relative z-10">
              {/* Identity */}
              <div className="text-center space-y-3 pb-6 border-b border-imperium-steel-dark">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block"
                >
                  <h3 className="font-display text-4xl uppercase tracking-widest text-imperium-crimson">
                    OALACEA
                  </h3>
                </motion.div>
                <p className="font-terminal text-imperium-steel">
                  [SERVANT_OF_CODE] // [FORGE_WORLD_TERRA]
                </p>
                <p className="font-terminal text-sm text-imperium-steel-dark max-w-md mx-auto">
                  A digital domain forged in the fires of innovation. An immersive 3D experience combining technical creativity with modern design principles.
                </p>
              </div>

              {/* Tech Stack - Brutalist Style */}
              <div className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-5">
                <h4 className="font-display text-sm uppercase tracking-wider text-imperium-gold mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-imperium-gold" />
                  Arsenal Technologique
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 15', 'React 19', 'Three.js', 'Prisma', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'TanStack Query', 'TypeScript'].map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-3 py-1.5 font-terminal text-xs border border-imperium-steel-dark bg-imperium-black text-imperium-bone hover:border-imperium-crimson hover:text-imperium-crimson transition-colors cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Navigation Links - Brutalist Style */}
              <div className="space-y-3">
                <h4 className="font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
                  <span className="w-1 h-4 bg-imperium-steel" />
                  Navigation Links
                </h4>
                <div className="space-y-2">
                  <motion.a
                    href="/blog"
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group flex items-center gap-4 px-4 py-4 border border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:bg-imperium-crimson/10 hover:border-imperium-crimson hover:text-imperium-bone transition-all"
                  >
                    <FileText className="h-5 w-5 text-imperium-gold group-hover:text-imperium-crimson transition-colors" />
                    <span className="font-display uppercase tracking-wider flex-1">Blog Archives</span>
                    <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.a>
                  <motion.a
                    href="/portfolio"
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group flex items-center gap-4 px-4 py-4 border border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:bg-imperium-crimson/10 hover:border-imperium-crimson hover:text-imperium-bone transition-all"
                  >
                    <FolderKanban className="h-5 w-5 text-imperium-gold group-hover:text-imperium-crimson transition-colors" />
                    <span className="font-display uppercase tracking-wider flex-1">Project Forge</span>
                    <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.a>
                </div>
              </div>

              {/* Contact - Brutalist Style */}
              <div className="pt-6 border-t border-imperium-steel-dark">
                <h4 className="font-display text-sm uppercase tracking-wider text-imperium-steel mb-4 text-center">
                  Establish CommLink
                </h4>
                <div className="flex items-center justify-center gap-4">
                  <motion.a
                    href="https://github.com/oalacea"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group p-4 border-2 border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:text-imperium-bone hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-all"
                    aria-label="GitHub"
                  >
                    <Github className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </motion.a>
                  <motion.a
                    href="mailto:oalacea@proton.me"
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group p-4 border-2 border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:text-imperium-bone hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-all"
                    aria-label="Email"
                  >
                    <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-4 shrink-0">
            <div className="flex items-center justify-between font-terminal text-xs text-imperium-steel-dark">
              <span>Build v1.0.41 // STABLE</span>
              <span>[ESC] Close data slate</span>
            </div>
          </div>

          {/* Bottom scanline */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ width: '25%' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
