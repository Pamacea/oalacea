'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Github, Code2, Smartphone, Box, Sparkles, FolderKanban } from 'lucide-react';
import { useProject } from '@/features/portfolio/hooks';

interface ProjectReadingModalProps {
  slug: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  total?: number;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WEB: { icon: Code2, color: 'text-blue-400', label: 'Web' },
  MOBILE: { icon: Smartphone, color: 'text-green-400', label: 'Mobile' },
  THREE_D: { icon: Box, color: 'text-purple-400', label: '3D' },
  AI: { icon: Sparkles, color: 'text-pink-400', label: 'AI' },
  OTHER: { icon: FolderKanban, color: 'text-zinc-400', label: 'Autre' },
};

export function ProjectReadingModal({ slug, onClose, onNext, onPrevious, currentIndex = 0, total = 0 }: ProjectReadingModalProps) {
  const { data: project, isLoading } = useProject(slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <p className="text-zinc-500">Chargement...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-500">Projet non trouvé</p>
          <button onClick={onClose} className="mt-4 text-amber-500 hover:text-amber-400">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const images = project.images || [];
  const hasMultipleImages = images.length > 1;
  const techStack = project.techStack || [];
  const hasGithub = project.githubUrl && project.githubUrl.length > 0;
  const hasLiveUrl = project.liveUrl && project.liveUrl.length > 0;
  const category = project.category;
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  const Icon = categoryConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[52] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-[85vw] max-w-4xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Projet</h2>
              <p className="text-xs text-zinc-500">{categoryConfig.label}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Projet précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {total > 0 && (
              <span className="text-xs text-zinc-600 min-w-[3rem] text-center">
                {currentIndex + 1}/{total}
              </span>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Projet suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <article className="max-w-3xl mx-auto">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-800 ${categoryConfig.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {categoryConfig.label}
              </span>
              {project.year && (
                <span className="text-xs text-zinc-500">{project.year}</span>
              )}
              {project.featured && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-300">
                  À la une
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-4">{project.title}</h1>

            {/* Description */}
            <p className="text-zinc-300 text-lg leading-relaxed mb-6">{project.description}</p>

            {/* Images Gallery */}
            {images.length > 0 && (
              <div className="mb-6">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {hasMultipleImages && (
                    <>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentImageIndex ? 'bg-amber-500 scale-125' : 'bg-zinc-600'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                {hasMultipleImages && (
                  <p className="text-center text-xs text-zinc-500 mt-2">
                    Image {currentImageIndex + 1} sur {images.length}
                  </p>
                )}
              </div>
            )}

            {/* Links */}
            {(hasGithub || hasLiveUrl) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {hasGithub && (
                  <button
                    onClick={() => window.open(project.githubUrl!, '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    Code source
                  </button>
                )}
                {hasLiveUrl && (
                  <button
                    onClick={() => window.open(project.liveUrl!, '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 text-zinc-900 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir le site
                  </button>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {techStack.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Technologies utilisées</h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {project.longDescription && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">À propos</h3>
                <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
                  {project.longDescription}
                </div>
              </div>
            )}

            {/* Features List */}
            {project.features && project.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Fonctionnalités</h3>
                <ul className="space-y-2">
                  {project.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-amber-500 mt-1">→</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <div className="h-20" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
          <span className="text-xs text-zinc-600">
            Utilisez les flèches ← → pour naviguer
          </span>
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Fermer (ESC)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
