'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, Tag, Eye, Loader2 } from 'lucide-react';
import { useBlogPost } from '@/features/blog/hooks';

interface BlogReadingModalProps {
  slug: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  total?: number;
}

// Markdown renderer with proper React keys
function MarkdownContent({ content }: { content: string }) {
  const parsedElements = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let inList = false;
    let codeContent = '';
    let listItems: React.ReactNode[] = [];
    let listIndex = 0;

    const processInline = (text: string): React.ReactNode => {
      let processed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');
      processed = processed.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
      processed = processed.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
      processed = processed.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');
      processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');
      return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="code-block">
              <button
                className="copy-button"
                onClick={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  navigator.clipboard.writeText(codeContent);
                  btn.textContent = 'Copied!';
                  setTimeout(() => btn.textContent = 'Copy', 2000);
                }}
              >Copy</button>
              <code>{codeContent}</code>
            </pre>
          );
          codeContent = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h1 key={`h1-${i}`} className="markdown-h1">{processInline(line.substring(2))}</h1>);
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h2 key={`h2-${i}`} className="markdown-h2">{processInline(line.substring(3))}</h2>);
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h3 key={`h3-${i}`} className="markdown-h3">{processInline(line.substring(4))}</h3>);
        continue;
      }
      if (line.startsWith('#### ')) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h4 key={`h4-${i}`} className="markdown-h4">{processInline(line.substring(5))}</h4>);
        continue;
      }
      if (line.match(/^---+$|^===+$/)) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<hr key={`hr-${i}`} className="markdown-hr" />);
        continue;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) {
          inList = true;
          listIndex = 0;
        }
        listItems.push(<li key={`li-${i}-${listIndex++}`}>{processInline(line.trim().substring(2))}</li>);
        continue;
      }
      if (/^\d+\.\s/.test(line.trim())) {
        if (inList && listItems.length > 0) {
          elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
          listItems = [];
        }
        if (!inList) {
          inList = true;
          listIndex = 0;
        }
        listItems.push(<li key={`li-${i}-${listIndex++}`}>{processInline(line.trim().replace(/^\d+\.\s/, ''))}</li>);
        continue;
      }
      if (inList && listItems.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="markdown-ul">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      if (line.startsWith('> ')) {
        elements.push(<blockquote key={`blockquote-${i}`} className="markdown-blockquote">{processInline(line.substring(2))}</blockquote>);
        continue;
      }
      if (line.trim() === '') {
        elements.push(<br key={`br-${i}`} />);
        continue;
      }
      if (line.trim() !== '') {
        elements.push(<p key={`p-${i}`} className="markdown-p">{processInline(line)}</p>);
      }
    }

    // Flush any remaining list items
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`ul-final`} className="markdown-ul">{listItems}</ul>);
    }

    return elements;
  }, [content]);

  return <div className="markdown-content">{parsedElements}</div>;
}

export function BlogReadingModal({ slug, onClose, onNext, onPrevious, currentIndex = 0, total = 0 }: BlogReadingModalProps) {
  const { data: post, isLoading } = useBlogPost(slug);
  const scrollProgress = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      scrollProgress.current = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="ml-3 text-zinc-500">Chargement...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-500">Article non trouvé</p>
          <button onClick={onClose} className="mt-4 text-amber-500 hover:text-amber-400">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const readingTime = post.readingTime || Math.ceil((post.content?.length || 0) / 1000);

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
              <h2 className="text-sm font-semibold text-zinc-100">Blog</h2>
              <p className="text-xs text-zinc-500">Lecture</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Article précédent"
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
                title="Article suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="h-0.5 bg-zinc-900 shrink-0">
          <div
            className="h-full bg-amber-500 transition-all duration-150"
            style={{ width: `${scrollProgress.current * 100}%` }}
          />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6">
          <article className="max-w-2xl mx-auto">
            {post.coverImage && (
              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-6">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min
              </span>
              {post.category && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-zinc-100">
                  {post.category.name}
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="h-3.5 w-3.5 text-zinc-500" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-zinc-400 hover:text-zinc-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {post.excerpt && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 mb-6">
                <p className="text-zinc-300 italic">{post.excerpt}</p>
              </div>
            )}

            <MarkdownContent content={post.content || ''} />
          </article>

          <div className="h-20" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
          <button
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Voir sur le site
          </button>
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

const styles = `
  .markdown-content { color: rgb(212 212 212); line-height: 1.75; }
  .markdown-h1 { font-size: 1.875rem; font-weight: 700; color: rgb(244 244 245); margin-top: 2rem; margin-bottom: 1rem; }
  .markdown-h2 { font-size: 1.5rem; font-weight: 600; color: rgb(244 244 245); margin-top: 1.75rem; margin-bottom: 0.75rem; }
  .markdown-h3 { font-size: 1.25rem; font-weight: 600; color: rgb(251 191 36); margin-top: 1.5rem; margin-bottom: 0.5rem; }
  .markdown-h4 { font-size: 1.125rem; font-weight: 500; color: rgb(244 244 245); margin-top: 1rem; margin-bottom: 0.5rem; }
  .markdown-p { margin-top: 0.75rem; margin-bottom: 0.75rem; }
  .markdown-ul, .markdown-ol { margin-top: 1rem; margin-bottom: 1rem; padding-left: 1.5rem; }
  .markdown-ul li, .markdown-ol li { margin-top: 0.25rem; margin-bottom: 0.25rem; }
  .markdown-blockquote { border-left: 3px solid rgb(251 191 36); padding-left: 1rem; margin-top: 1rem; margin-bottom: 1rem; color: rgb(161 161 170); font-style: italic; }
  .markdown-hr { border: none; border-top: 1px solid rgb(39 39 42); margin-top: 2rem; margin-bottom: 2rem; }
  .inline-code { background: rgb(120 53 15 / 0.5); color: rgb(244 244 245); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: ui-monospace, monospace; font-size: 0.875em; }
  .markdown-link { color: rgb(251 191 36); text-decoration: underline; }
  .markdown-link:hover { color: rgb(252 211 77); }
  .code-block { background: rgb(9 9 11); border: 1px solid rgb(39 39 42); border-radius: 0.5rem; padding: 1rem; margin-top: 1rem; margin-bottom: 1rem; overflow-x: auto; position: relative; }
  .code-block code { color: rgb(52 211 153); font-family: ui-monospace, monospace; font-size: 0.875rem; white-space: pre-wrap; }
  .copy-button { position: absolute; top: 0.5rem; right: 0.5rem; background: rgb(39 39 42); color: rgb(212 212 212); border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; }
  .copy-button:hover { background: rgb(63 63 70); }
`;
