'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FolderKanban, Code2, Smartphone, Box, Sparkles, Hammer } from 'lucide-react';
import { useProjects } from '@/features/portfolio/hooks';
import { useModalStore } from '@/store/modal-store';
import { ProjectReadingModal } from './ProjectReadingModal';
import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WEB: { icon: Code2, color: 'text-imperium-crimson', label: 'Web' },
  MOBILE: { icon: Smartphone, color: 'text-imperium-gold', label: 'Mobile' },
  THREE_D: { icon: Box, color: 'text-imperium-teal', label: '3D' },
  AI: { icon: Sparkles, color: 'text-purple-400', label: 'AI' },
  OTHER: { icon: FolderKanban, color: 'text-imperium-steel', label: 'Autre' },
};

export function ProjectListingModal() {
  const { close } = useModalStore();

  // Debug global keydown listener to track all key events
  useEffect(() => {
    const debugKeydown = (e: KeyboardEvent) => {
      console.log('[DEBUG GLOBAL] Key event:', {
        key: e.key,
        code: e.code,
        type: e.type,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        defaultPrevented: e.defaultPrevented,
      });
    };
    window.addEventListener('keydown', debugKeydown, true);
    return () => window.removeEventListener('keydown', debugKeydown, true);
  }, []);
  const { data: projects, isLoading } = useProjects();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { playClick, playHover } = useUISound();

  // Debug: log when modal mounts
  console.log('[ProjectListingModal] MOUNTED - isOpen=true, component mounted');

  const projectsList = projects || [];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < projectsList.length - 1;

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      console.log('[ProjectListingModal] handleEscape called - key:', e.key, 'code:', e.code, 'selectedProject:', selectedProject);
      if (e.key === 'Escape') {
        console.log('[ProjectListingModal] Escape detected, closing...');
        if (selectedProject) {
          setSelectedProject(null);
        } else {
          console.log('[ProjectListingModal] Calling close() from handleEscape');
          close();
        }
      }
    };
    console.log('[ProjectListingModal] Adding Escape listener (capture phase)');
    // Use capture phase to ensure we catch Escape before other handlers
    window.addEventListener('keydown', handleEscape, true);
    return () => {
      console.log('[ProjectListingModal] Removing Escape listener');
      window.removeEventListener('keydown', handleEscape, true);
    };
  }, [selectedProject, close]);

  const handleSelectProject = (slug: string, index: number) => {
    setSelectedIndex(index);
    setSelectedProject(slug);
    playClick();
  };

  const handleClose = () => {
    console.log('[ProjectListingModal] handleClose called - selectedProject:', selectedProject);
    if (selectedProject) {
      setSelectedProject(null);
    } else {
      console.log('[ProjectListingModal] Calling close()');
      close();
    }
  };

  if (selectedProject) {
    return (
      <ProjectReadingModal
        slug={selectedProject}
        onClose={() => setSelectedProject(null)}
        onNext={hasNext ? () => {
          const nextIndex = selectedIndex + 1;
          setSelectedIndex(nextIndex);
          setSelectedProject(projectsList[nextIndex].slug);
        } : undefined}
        onPrevious={hasPrev ? () => {
          const prevIndex = selectedIndex - 1;
          setSelectedIndex(prevIndex);
          setSelectedProject(projectsList[prevIndex].slug);
        } : undefined}
        currentIndex={selectedIndex}
        total={projectsList.length}
      />
    );
  }

  return (
    <AnimatePresence>
      {/* Backdrop with chaotic overlay */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-imperium-black-deep/90 backdrop-blur-sm"
        onClick={(e) => {
          console.log('[ProjectListingModal] Backdrop clicked!', e);
          handleClose();
        }}
      >
        <ChaoticOverlay type="all" opacity={0.3} />
        <ScanlineBeam color="#d4af37" duration={3.5} />
      </motion.div>

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ scale: 0.9, opacity: 0, rotateX: 10, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotateX: -10, y: 50 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="fixed left-1/2 top-1/2 z-[10000] w-[90vw] max-w-4/5 h-[85vh] -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-imperium-black-raise border-2 border-imperium-gold rounded-none shadow-[0_0_60px_rgba(212,175,55,0.3),_8px_8px_0_rgba(212,175,55,0.15)] overflow-hidden flex flex-col h-full">
          {/* Decorative hammer */}
          <div className="absolute top-20 right-10 opacity-5 pointer-events-none">
            <Hammer className="w-32 h-32 text-imperium-gold" />
          </div>

          {/* Header with brutalist style */}
          <div className="relative border-b-2 border-imperium-gold bg-imperium-black-deep/80 px-6 py-5 shrink-0">
            {/* Scanlines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(212,175,55,0.2)_1px,rgba(212,175,55,0.2)_2px)]" />
            </div>

            {/* Top accent line */}
            <div className="absolute left-0 top-0 right-0 h-1 bg-imperium-gold">
              <motion.div
                className="h-full bg-imperium-crimson"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: '20%' }}
              />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="border-2 border-imperium-gold bg-imperium-gold/10 p-3">
                  <FolderKanban className="h-6 w-6 text-imperium-gold" />
                </div>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-widest text-imperium-bone">
                    <GlitchText intensity="high">
                      Forge Projects
                    </GlitchText>
                  </h2>
                  <p className="font-terminal text-sm text-imperium-steel mt-1">
                    {'>'} Imperial Manufactorum Output
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleClose}
                onMouseEnter={playHover}
                className="group p-2 text-imperium-steel hover:text-imperium-gold transition-colors"
              >
                <motion.div
                  className="absolute inset-0 bg-imperium-gold/10"
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl mb-4"
                >
                  ⚙
                </motion.div>
                <p className="font-terminal text-imperium-steel">Loading forge data...</p>
              </div>
            ) : projectsList.length === 0 ? (
              <div className="text-center py-20">
                <Hammer className="h-16 w-16 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
                <p className="font-terminal text-imperium-steel">No projects in archives</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                {projectsList.map((project, index) => {
                  const categorySlug = typeof project.category === 'string' ? project.category : project.category?.slug || 'other';
                  const config = CATEGORY_CONFIG[categorySlug] || CATEGORY_CONFIG.OTHER;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}
                      onMouseEnter={playHover}
                      onClick={() => handleSelectProject(project.slug, index)}
                      className="group relative border border-imperium-steel-dark bg-imperium-black/50 hover:bg-imperium-gold/5 hover:border-imperium-gold cursor-pointer transition-all duration-200 overflow-hidden"
                    >
                      {/* Corner accent on hover */}
                      <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-imperium-gold group-hover:w-4 group-hover:h-4 transition-all duration-200" />

                      {project.thumbnail && (
                        <div className="aspect-video overflow-hidden border-b border-imperium-steel-dark/50">
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display text-imperium-bone group-hover:text-imperium-gold transition-colors">
                            {project.title}
                          </h3>
                          {project.featured && (
                            <span className="text-xs bg-imperium-gold/20 text-imperium-gold px-2 py-0.5 border border-imperium-gold/30">
                              ★
                            </span>
                          )}
                        </div>

                        <p className="font-terminal text-sm text-imperium-steel line-clamp-2 mb-3">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-terminal border border-imperium-steel-dark ${config.color}`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </span>
                          {project.year && (
                            <span className="text-xs font-terminal text-imperium-steel-dark">
                              {project.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-4 shrink-0">
            <div className="flex items-center justify-between font-terminal text-xs text-imperium-steel-dark">
              <span>
                {projectsList.length} project{projectsList.length > 1 ? 's' : ''} archived
              </span>
              <span>[ESC] Exit forge</span>
            </div>
          </div>

          {/* Bottom scanline */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-imperium-gold to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              style={{ width: '30%' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
