'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, Tag, Eye, Scroll } from 'lucide-react';
import { useBlogPost } from '@/features/blog/hooks';
import { sanitizeInlineHtml } from '@/lib/sanitize';
import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

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
      const sanitized = sanitizeInlineHtml(processed);
      return <span dangerouslySetInnerHTML={{ __html: sanitized }} />;
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
                  btn.textContent = 'COPIED!';
                  setTimeout(() => btn.textContent = 'COPY', 2000);
                }}
              >COPY</button>
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
  const { playHover, playClick } = useUISound();

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
      <div className="fixed inset-0 z-[52] flex items-center justify-center bg-imperium-black-deep/95 backdrop-blur-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mr-4"
        >
          ⚙
        </motion.div>
        <p className="font-terminal text-imperium-steel">Loading archives...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 z-[52] flex items-center justify-center bg-imperium-black-deep/95 backdrop-blur-sm">
        <div className="border-2 border-imperium-crimson bg-imperium-black-raise p-8 text-center">
          <p className="font-terminal text-imperium-steel mb-4">[RECORD_NOT_FOUND]</p>
          <button onClick={onClose} className="font-terminal text-imperium-crimson hover:text-imperium-gold transition-colors uppercase">
            Return to archives
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
      className="fixed inset-0 z-[52] flex items-center justify-center bg-imperium-black-deep/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <ChaoticOverlay type="scanlines" opacity={0.2} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, rotateX: 5 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.95, opacity: 0, rotateX: -5 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-[90vw] max-w-4xl h-[92vh] bg-imperium-black-raise border-2 border-imperium-crimson rounded-none shadow-[0_0_60px_rgba(154,17,21,0.4)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b-2 border-imperium-crimson bg-imperium-black-deep/80 px-6 py-4 shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.2)_1px,rgba(154,17,21,0.2)_2px)]" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={onClose}
                onMouseEnter={playHover}
                className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="border-2 border-imperium-crimson bg-imperium-crimson/10 p-2">
                <Scroll className="h-5 w-5 text-imperium-crimson" />
              </div>
              <div>
                <h2 className="font-display text-sm uppercase tracking-wider text-imperium-bone">Archives</h2>
                <p className="font-terminal text-xs text-imperium-steel">{'>'} Reading mode</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onPrevious && (
                <motion.button
                  onClick={onPrevious}
                  onMouseEnter={playHover}
                  className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
                  title="Article précédent"
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
                  onMouseEnter={playHover}
                  className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
                  title="Article suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="h-1 bg-imperium-black shrink-0 relative overflow-hidden">
          <motion.div
            className="h-full bg-imperium-crimson absolute top-0 left-0"
            animate={{ width: `${scrollProgress.current * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-6 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <article className="max-w-3xl mx-auto relative z-10">
            {post.coverImage && (
              <div className="aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black mb-6 relative">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-imperium-crimson/20 pointer-events-none" />
              </div>
            )}

            <h1 className="font-display text-4xl uppercase tracking-wider text-imperium-bone mb-6">
              <GlitchText intensity="high">
                {post.title}
              </GlitchText>
            </h1>

            <div className="flex flex-wrap items-center gap-4 font-terminal text-sm text-imperium-steel mb-6 pb-6 border-b border-imperium-steel-dark">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-imperium-crimson" />
                {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-imperium-gold" />
                {readingTime} min read
              </span>
              {post.category && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs border border-imperium-crimson text-imperium-crimson">
                  {post.category.name}
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-imperium-steel-dark">
                <Tag className="h-3.5 w-3.5 text-imperium-steel-dark" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="font-terminal text-xs text-imperium-steel hover:text-imperium-crimson transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {post.excerpt && (
              <div className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-4 mb-6">
                <p className="font-terminal italic text-imperium-steel">{post.excerpt}</p>
              </div>
            )}

            <MarkdownContent content={post.content || ''} />
          </article>

          <div className="h-20" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 shrink-0">
          <motion.button
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            onMouseEnter={playHover}
            className="flex items-center gap-2 font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors"
          >
            <Eye className="h-4 w-4" />
            View on site
          </motion.button>
          <button
            onClick={onClose}
            className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
          >
            [ESC] Close
          </button>
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
      </motion.div>
    </motion.div>
  );
}
