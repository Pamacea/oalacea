'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Calendar, Tag, Clock, Minimize2 } from 'lucide-react';
import { useBlogDocumentsStore } from '@/store/blog-documents-store';
import { MarkdownRenderer } from '@/components/ui/markdown';
import type { Post } from '@/generated/prisma/client';

interface BlogPostReaderProps {
  post: Post;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function BlogPostReader({ post, onClose, onNext, onPrevious }: BlogPostReaderProps) {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [readingProgress, setReadingProgress] = useState(0);
  const { getPrevPost, getNextPost } = useBlogDocumentsStore();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPost(post);
    setReadingProgress(0);
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const div = contentRef.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
      return () => div.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft' && onPrevious) {
        handlePrevious();
      }
      if (e.key === 'ArrowRight' && onNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, onNext, onPrevious]);

  const readingTime = currentPost.readingTime || Math.ceil(currentPost.content.length / 1000);

  const handleNext = useCallback(() => {
    const next = getNextPost(currentPost);
    if (next) {
      setCurrentPost(next);
      setReadingProgress(0);
      onNext?.();
    }
  }, [currentPost, getNextPost, onNext]);

  const handlePrevious = useCallback(() => {
    const prev = getPrevPost(currentPost);
    if (prev) {
      setCurrentPost(prev);
      setReadingProgress(0);
      onPrevious?.();
    }
  }, [currentPost, getPrevPost, onPrevious]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        onClick={handleClickOutside}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg border border-green-500/30 bg-slate-950/95 shadow-2xl shadow-green-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reading Progress Bar */}
          <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          {/* Terminal Header */}
          <div className="flex items-start justify-between border-b border-green-500/20 bg-slate-900/80 px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 font-mono text-sm text-green-400">
                blog_reader.sh - {currentPost.slug}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-green-500/20 hover:text-green-400"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cover Image */}
          {currentPost.coverImage && (
            <div className="relative h-48 overflow-hidden border-b border-green-500/20">
              <img
                src={currentPost.coverImage}
                alt={currentPost.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
            </div>
          )}

          {/* Post Header */}
          <div className="border-b border-green-500/10 bg-slate-900/50 px-6 py-4">
            <h1 className="font-mono text-xl font-bold text-green-200">{currentPost.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              {currentPost.categoryId && (
                <span className="rounded bg-green-500/20 px-2 py-0.5 text-green-400">
                  [BLOG]
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(currentPost.publishDate ?? currentPost.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime}min
              </span>
              {currentPost.tags && currentPost.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {currentPost.tags.slice(0, 3).join(', ')}
                  {currentPost.tags.length > 3 && ' +'}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="overflow-y-auto max-h-[45vh] bg-slate-950/80 px-6 py-6 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-green-500/30"
          >
            {currentPost.excerpt && (
              <div className="mb-6 border-l-2 border-green-500 bg-green-500/5 p-4 font-mono text-sm italic text-slate-400">
                {'>'} {currentPost.excerpt}
              </div>
            )}
            <MarkdownRenderer content={currentPost.content} isTerminal className="markdown-content" />
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between border-t border-green-500/20 bg-slate-900/80 px-6 py-3">
            <button
              onClick={handlePrevious}
              disabled={!getPrevPost(currentPost)}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors hover:bg-green-500/20 hover:text-green-400 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {'<'} PREV
            </button>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span>[ESC] close</span>
              <span>[ARROWS] navigate</span>
            </div>

            <button
              onClick={handleNext}
              disabled={!getNextPost(currentPost)}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors hover:bg-green-500/20 hover:text-green-400 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              NEXT {'>'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scanline Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.02)_50%)] bg-[length:100%_4px]" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
