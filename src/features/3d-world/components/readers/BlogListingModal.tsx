'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Clock } from 'lucide-react';
import { useBlogPosts } from '@/features/blog/hooks';
import { useModalStore } from '@/store/modal-store';
import { BlogReadingModal } from './BlogReadingModal';

export function BlogListingModal() {
  const { close } = useModalStore();
  const { data: postsData, isLoading } = useBlogPosts({ published: true, limit: 100 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);

  const posts = postsData?.posts || [];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < posts.length - 1;

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

  const handleSelectBlog = (slug: string, index: number) => {
    setSelectedIndex(index);
    setSelectedBlog(slug);
  };

  const handleClose = () => {
    if (selectedBlog) {
      setSelectedBlog(null);
    } else {
      close();
    }
  };

  if (selectedBlog) {
    return (
      <BlogReadingModal
        slug={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onNext={hasNext ? () => {
          const nextIndex = selectedIndex + 1;
          setSelectedIndex(nextIndex);
          setSelectedBlog(posts[nextIndex].slug);
        } : undefined}
        onPrevious={hasPrev ? () => {
          const prevIndex = selectedIndex - 1;
          setSelectedIndex(prevIndex);
          setSelectedBlog(posts[prevIndex].slug);
        } : undefined}
        currentIndex={selectedIndex}
        total={posts.length}
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
            <h2 className="text-lg font-semibold text-zinc-100">Blog</h2>
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
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500">Aucun article disponible</p>
              </div>
            ) : (
              <div className="p-2">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mb-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-zinc-100 font-medium">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                          {post.publishDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.publishDate).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          )}
                          {post.readingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readingTime} min
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectBlog(post.slug, index)}
                        className="px-4 py-2 text-sm font-medium bg-amber-500 text-zinc-900 rounded-lg hover:bg-amber-400 transition-colors shrink-0"
                      >
                        Lire
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
            <span className="text-xs text-zinc-600">
              {posts.length} article{posts.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-600">ESC pour fermer</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
