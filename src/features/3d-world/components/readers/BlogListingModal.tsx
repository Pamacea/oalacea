'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Clock, Scroll, Skull } from 'lucide-react';
import { useBlogPosts } from '@/features/blog/hooks';
import { useModalStore } from '@/store/modal-store';
import { BlogReadingModal } from './BlogReadingModal';
import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

export function BlogListingModal() {
  const { close } = useModalStore();
  const { data: postsData, isLoading } = useBlogPosts({ published: true, limit: 100 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const { playClick, playHover } = useUISound();

  const posts = postsData?.posts || [];
  const hasPrev = useMemo(() => selectedIndex > 0, [selectedIndex]);
  const hasNext = useMemo(() => selectedIndex < posts.length - 1, [selectedIndex, posts.length]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBlog) {
          setSelectedBlog(null);
        } else {
          close();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedBlog, close]);

  const handleSelectBlog = useCallback((slug: string, index: number) => {
    setSelectedIndex(index);
    setSelectedBlog(slug);
    playClick();
  }, [playClick]);

  const handleClose = useCallback(() => {
    if (selectedBlog) {
      setSelectedBlog(null);
    } else {
      close();
    }
  }, [selectedBlog, close]);

  const handleNext = useCallback(() => {
    const nextIndex = selectedIndex + 1;
    if (nextIndex < posts.length && posts[nextIndex]) {
      setSelectedIndex(nextIndex);
      setSelectedBlog(posts[nextIndex].slug);
    }
  }, [selectedIndex, posts]);

  const handlePrevious = useCallback(() => {
    const prevIndex = selectedIndex - 1;
    if (prevIndex >= 0 && posts[prevIndex]) {
      setSelectedIndex(prevIndex);
      setSelectedBlog(posts[prevIndex].slug);
    }
  }, [selectedIndex, posts]);

  if (selectedBlog) {
    return (
      <BlogReadingModal
        slug={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onNext={hasNext ? handleNext : undefined}
        onPrevious={hasPrev ? handlePrevious : undefined}
        currentIndex={selectedIndex}
        total={posts.length}
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-imperium-black-deep/90 backdrop-blur-sm"
        onClick={() => handleClose()}
      >
        <ChaoticOverlay type="all" opacity={0.3} />
        <ScanlineBeam color="#9a1115" duration={4} />
      </motion.div>

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ scale: 0.9, opacity: 0, rotateX: 10, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotateX: -10, y: 50 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative z-[51] w-[90vw] max-w-4xl h-[85vh] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="bg-imperium-black-raise border-2 border-imperium-crimson rounded-none shadow-[0_0_60px_rgba(154,17,21,0.4),_8px_8px_0_rgba(154,17,21,0.2)] overflow-hidden flex flex-col h-full">
          {/* Decorative skull */}
          <div className="absolute top-20 right-10 opacity-5 pointer-events-none">
            <Skull className="w-32 h-32 text-imperium-crimson" />
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
                style={{ width: '20%' }}
              />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="border-2 border-imperium-crimson bg-imperium-crimson/10 p-3">
                  <Scroll className="h-6 w-6 text-imperium-crimson" />
                </div>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-widest text-imperium-bone">
                    <GlitchText intensity="severe">
                      Archives
                    </GlitchText>
                  </h2>
                  <p className="font-terminal text-sm text-imperium-steel mt-1">
                    {'>'} Imperial Knowledge Database
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => handleClose()}
                onMouseEnter={() => playHover()}
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl mb-4"
                >
                  ⚙
                </motion.div>
                <p className="font-terminal text-imperium-steel">Loading archives...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <Skull className="h-16 w-16 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
                <p className="font-terminal text-imperium-steel">No records found</p>
              </div>
            ) : (
              <div className="p-4 space-y-2 relative z-10">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring', damping: 20 }}
                    onMouseEnter={() => playHover()}
                    onClick={() => {
                      handleSelectBlog(post.slug, index);
                    }}
                    className="group relative border border-imperium-steel-dark bg-imperium-black/50 hover:bg-imperium-crimson/10 hover:border-imperium-crimson cursor-pointer transition-all duration-200"
                  >
                    {/* Corner accent on hover */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-imperium-crimson group-hover:w-4 group-hover:h-4 transition-all duration-200" />

                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Index */}
                        <span className="font-terminal text-imperium-steel-dark group-hover:text-imperium-crimson transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-imperium-bone group-hover:text-imperium-crimson transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="font-terminal text-sm text-imperium-steel line-clamp-2 mt-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs font-terminal text-imperium-steel-dark">
                            {post.publishDate && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.publishDate).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            )}
                            {post.readingTime && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <span className="font-display text-imperium-steel-dark group-hover:text-imperium-crimson group-hover:translate-x-1 transition-all">
                          »
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-4 shrink-0">
            <div className="flex items-center justify-between font-terminal text-xs text-imperium-steel-dark">
              <span>
                {posts.length} record{posts.length > 1 ? 's' : ''} found
              </span>
              <span>[ESC] Close terminal</span>
            </div>
          </div>

          {/* Bottom scanline */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ width: '30%' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
