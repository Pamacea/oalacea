'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code2, Smartphone, Box, Sparkles, FolderKanban, Hammer, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { GlitchText } from '@/components/ui/imperium';

interface ProjectTemplateProps {
  project: {
    id: string;
    slug: string;
    title: string;
    description: string;
    longDescription: string | null;
    thumbnail: string | null;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    featured: boolean;
    year: number;
    category?: {
      name: string;
      slug: string;
    } | null;
    images?: string[];
    features?: string[];
  };
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  total?: number;
  variant?: 'modal' | 'page';
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WEB: { icon: Code2, color: 'text-imperium-crimson', label: 'Web' },
  MOBILE: { icon: Smartphone, color: 'text-imperium-gold', label: 'Mobile' },
  THREE_D: { icon: Box, color: 'text-imperium-teal', label: '3D' },
  AI: { icon: Sparkles, color: 'text-purple-400', label: 'AI' },
  OTHER: { icon: FolderKanban, color: 'text-imperium-steel', label: 'Autre' },
};

export function ProjectTemplate({
  project,
  onClose,
  onNext,
  onPrevious,
  currentIndex = 0,
  total = 0,
  variant = 'page',
}: ProjectTemplateProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  const images = project.images?.filter((img): img is string => img !== null).length
    ? project.images.filter((img): img is string => img !== null)
    : project.thumbnail
      ? [project.thumbnail]
      : [];
  const hasMultipleImages = images.length > 1;
  const techStack = project.techStack || [];
  const hasGithub = project.githubUrl && project.githubUrl.length > 0;
  const hasLiveUrl = project.liveUrl && project.liveUrl.length > 0;
  const categorySlug = typeof project.category === 'string' ? project.category : project.category?.slug || 'OTHER';
  const categoryConfig = CATEGORY_CONFIG[categorySlug] || CATEGORY_CONFIG.OTHER;
  const Icon = categoryConfig.icon;
  const isModal = variant === 'modal';

  const containerClass = isModal
    ? 'w-[90vw] max-w-4/5 h-[92vh] bg-imperium-black-raise border-2 border-imperium-gold rounded-none shadow-[0_0_60px_rgba(212,175,55,0.3)] overflow-hidden flex flex-col'
    : 'w-full bg-imperium-black-raise border-2 border-imperium-gold rounded-none overflow-hidden';

  const headerClass = isModal
    ? 'relative border-b-2 border-imperium-gold bg-imperium-black-deep/80 px-6 py-4 shrink-0'
    : 'relative border-b-2 border-imperium-gold bg-imperium-black-deep/80 px-4 md:px-6 py-4 shrink-0';

  const contentClass = isModal
    ? 'flex-1 overflow-y-auto px-6 py-6 relative'
    : 'overflow-y-auto px-4 md:px-6 py-6 relative';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(212,175,55,0.2)_1px,rgba(212,175,55,0.2)_2px)]" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose ? (
              <motion.button
                onClick={onClose}
                className="p-2 text-imperium-steel hover:text-imperium-gold border border-imperium-steel-dark hover:border-imperium-gold transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <Link
                href="/projets"
                className="p-2 text-imperium-steel hover:text-imperium-gold border border-imperium-steel-dark hover:border-imperium-gold transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div className="border-2 border-imperium-gold bg-imperium-gold/10 p-2">
              <Hammer className="h-5 w-5 text-imperium-gold" />
            </div>
            <div>
              <h2 className="font-display text-sm uppercase tracking-wider text-imperium-bone">Forge</h2>
              <p className="font-terminal text-xs text-imperium-steel">{'>'} {categoryConfig.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrevious && (
              <motion.button
                onClick={onPrevious}
                className="p-2 text-imperium-steel hover:text-imperium-gold border border-imperium-steel-dark hover:border-imperium-gold transition-colors"
                title="Projet précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}
            {total > 0 && (
              <span className="font-terminal text-xs text-imperium-steel-dark min-w-[3rem] text-center">
                {currentIndex + 1}/{total}
              </span>
            )}
            {onNext && (
              <motion.button
                onClick={onNext}
                className="p-2 text-imperium-steel hover:text-imperium-gold border border-imperium-steel-dark hover:border-imperium-gold transition-colors"
                title="Projet suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={contentClass}>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <article className="max-w-4xl mx-auto relative z-10">
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 font-terminal text-sm border-2 ${categoryConfig.color} border-imperium-gold bg-imperium-black`}>
              <Icon className="h-4 w-4" />
              {categoryConfig.label}
            </span>
            <span className="font-terminal text-xs text-imperium-steel-dark border border-imperium-steel-dark px-2 py-1">
              {project.year}
            </span>
            {project.featured && (
              <span className="text-xs bg-imperium-gold/20 text-imperium-gold px-2 py-1 border border-imperium-gold">
                ★ FEATURED
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-imperium-bone mb-4">
            <GlitchText intensity="high">
              {project.title}
            </GlitchText>
          </h1>

          {/* Description */}
          <p className="font-terminal text-lg text-imperium-steel leading-relaxed mb-6 border-l-4 border-imperium-gold pl-4">
            {project.description}
          </p>

          {/* Images Gallery */}
          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
                <img
                  src={images[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {hasMultipleImages && (
                  <>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 transition-all ${
                            i === currentImageIndex ? 'bg-imperium-gold scale-125' : 'bg-imperium-steel-dark'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-imperium-black/80 border border-imperium-gold text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-imperium-black/80 border border-imperium-gold text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {hasMultipleImages && (
                <p className="font-terminal text-center text-xs text-imperium-steel-dark mt-2">
                  [ {currentImageIndex + 1} / {images.length} ] BLUEPRINTS
                </p>
              )}
            </div>
          )}

          {/* Links */}
          {(hasGithub || hasLiveUrl) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {hasGithub && (
                <motion.a
                  href={project.githubUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
                >
                  <Github className="h-4 w-4" />
                  SOURCE CODE
                </motion.a>
              )}
              {hasLiveUrl && (
                <motion.a
                  href={project.liveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 font-terminal text-sm border-2 border-imperium-gold bg-imperium-gold/10 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  DEPLOYED UNIT
                </motion.a>
              )}
            </div>
          )}

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-gold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-imperium-gold" />
                Components Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech: string, i: number) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-3 py-1.5 font-terminal text-xs border border-imperium-steel-dark bg-imperium-black text-imperium-bone hover:border-imperium-crimson hover:text-imperium-crimson transition-colors cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {project.longDescription && (
            <div className="mb-6">
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-steel mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-imperium-steel" />
                Specifications
              </h3>
              <div className="font-terminal text-imperium-steel leading-relaxed whitespace-pre-line border-l-2 border-imperium-steel-dark pl-4">
                {project.longDescription}
              </div>
            </div>
          )}

          {/* Features List */}
          {project.features && project.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-steel mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-imperium-steel" />
                Capabilities
              </h3>
              <ul className="space-y-2">
                {project.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 font-terminal text-imperium-steel">
                    <span className="text-imperium-gold mt-0.5">▸</span>
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
      <div className="flex items-center justify-between px-6 py-4 border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 shrink-0">
        <span className="font-terminal text-xs text-imperium-steel-dark">
          [← →] Navigate archives
        </span>
        {onClose ? (
          <button
            onClick={onClose}
            className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
          >
            [ESC] Exit
          </button>
        ) : (
          <Link
            href="/projets"
            className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
          >
            {'<'} Back to forge
          </Link>
        )}
      </div>

      {/* Bottom scanline */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-imperium-gold to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ width: '30%' }}
        />
      </div>
    </div>
  );
}
