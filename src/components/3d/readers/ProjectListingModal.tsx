'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FolderKanban, Code2, Smartphone, Box, Sparkles } from 'lucide-react';
import { useProjects } from '@/hooks/usePortfolio';
import { useModalStore } from '@/store/modal-store';
import { ProjectReadingModal } from './ProjectReadingModal';

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WEB: { icon: Code2, color: 'text-blue-400', label: 'Web' },
  MOBILE: { icon: Smartphone, color: 'text-green-400', label: 'Mobile' },
  THREE_D: { icon: Box, color: 'text-purple-400', label: '3D' },
  AI: { icon: Sparkles, color: 'text-pink-400', label: 'AI' },
  OTHER: { icon: FolderKanban, color: 'text-zinc-400', label: 'Autre' },
};

export function ProjectListingModal() {
  const { close } = useModalStore();
  const { data: projects, isLoading } = useProjects();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projectsList = projects || [];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < projectsList.length - 1;

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProject) {
          setSelectedProject(null);
        } else {
          close();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedProject, close]);

  const handleSelectProject = (slug: string, index: number) => {
    setSelectedIndex(index);
    setSelectedProject(slug);
  };

  const handleClose = () => {
    if (selectedProject) {
      setSelectedProject(null);
    } else {
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
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        key="modal"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-[51] w-[600px] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Projets</h2>
            <button
              onClick={handleClose}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <p className="mt-4 text-zinc-500 text-sm">Chargement...</p>
              </div>
            ) : projectsList.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500">Aucun projet disponible</p>
              </div>
            ) : (
              <div className="p-2">
                {projectsList.map((project, index) => {
                  const config = CATEGORY_CONFIG[project.category] || CATEGORY_CONFIG.OTHER;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mb-2"
                    >
                      <div className="flex items-start gap-3">
                        {project.thumbnail && (
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-20 h-20 rounded-lg object-cover bg-zinc-900 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-zinc-100 font-medium">{project.title}</h3>
                            {project.featured && (
                              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                                À la une
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-zinc-800 ${config.color}`}>
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                              {project.year && (
                                <span className="text-xs text-zinc-600">{project.year}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleSelectProject(project.slug, index)}
                              className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors shrink-0"
                            >
                              Consulter
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
            <span className="text-xs text-zinc-600">
              {projectsList.length} projet{projectsList.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-600">ESC pour fermer</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
