'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { GlitchText } from '@/components/ui/imperium';
import { sanitizeInlineHtml } from '@/lib/sanitize';

interface BlogPostTemplateProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    publishDate: Date | null;
    readingTime: number | null;
    tags: string[] | null;
    category?: {
      name: string;
      slug: string;
    } | null;
    createdAt: Date;
  };
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  total?: number;
  variant?: 'modal' | 'page';
}

const CATEGORY_LABELS: Record<string, string> = {
  'tech': 'TECH',
  'design': 'DESIGN',
  'tutorial': 'TUTORIAL',
  'thoughts': 'THOUGHTS',
};

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
      elements.push(<ul key={'ul-final'} className="markdown-ul">{listItems}</ul>);
    }

    return elements;
  }, [content]);

  return <div className="markdown-content">{parsedElements}</div>;
}

export function BlogPostTemplate({
  post,
  onClose,
  onNext,
  onPrevious,
  currentIndex = 0,
  total = 0,
  variant = 'page',
}: BlogPostTemplateProps) {
  const scrollProgress = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const readingTime = post.readingTime || Math.ceil((post.content?.length || 0) / 1000);
  const isModal = variant === 'modal';

  const containerClass = isModal
    ? 'w-[90vw] max-w-4xl h-[92vh] bg-imperium-black-raise border-2 border-imperium-crimson rounded-none shadow-[0_0_60px_rgba(154,17,21,0.4)] overflow-hidden flex flex-col'
    : 'w-full bg-imperium-black-raise/95 border-2 border-imperium-crimson rounded-none overflow-hidden relative';

  const headerClass = isModal
    ? 'relative border-b-2 border-imperium-crimson bg-imperium-black-deep/80 px-6 py-4 shrink-0'
    : 'relative border-b-2 border-imperium-crimson bg-imperium-black-deep/80 px-4 md:px-6 py-4 shrink-0';

  const contentScrollClass = isModal
    ? 'flex-1 overflow-y-auto px-6 py-6 relative'
    : 'overflow-y-auto px-4 md:px-6 py-6 relative';

  return (
    <div className={containerClass}>
      {/* Glowing borders */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute inset-0 rounded-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.8)]" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.8)]" />
          <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.8)]" />
          <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.8)]" />
        </div>
      </div>

      {/* Corner glow pulses */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-none">
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 bg-imperium-crimson/20 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-32 h-32 bg-imperium-gold/20 blur-3xl"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Header */}
      <div className={headerClass}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.2)_1px,rgba(154,17,21,0.2)_2px)]" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose ? (
              <motion.button
                onClick={onClose}
                className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <Link
                href="/blogs"
                className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div className="border-2 border-imperium-crimson bg-imperium-crimson/10 p-2 relative">
              <motion.div
                className="absolute inset-0 bg-imperium-crimson/20"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="h-5 w-5 text-imperium-crimson flex items-center justify-center font-display text-lg relative z-10">
                📜
              </div>
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
                className="p-2 text-imperium-steel hover:text-imperium-crimson border border-imperium-steel-dark hover:border-imperium-crimson transition-colors"
                title="Article suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar with glow */}
      <div className="h-1 bg-imperium-black shrink-0 relative overflow-hidden">
        <motion.div
          className="h-full bg-imperium-crimson absolute top-0 left-0 shadow-[0_0_10px_rgba(154,17,21,1)]"
          animate={{ width: `${scrollProgress.current * 100}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className={contentScrollClass}>
        {/* Floating light orbs */}
        <motion.div
          className="absolute top-20 right-10 w-2 h-2 bg-imperium-crimson rounded-full blur-sm pointer-events-none"
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 left-10 w-1.5 h-1.5 bg-imperium-gold rounded-full blur-sm pointer-events-none"
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

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
              <div className="absolute inset-0 bg-gradient-to-t from-imperium-black via-transparent to-transparent" />
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover relative z-10" />
              <div className="absolute inset-0 border border-imperium-crimson/20 pointer-events-none" />
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-imperium-bone mb-6 relative">
            <motion.div
              className="absolute -left-4 -top-2 w-8 h-8 bg-imperium-crimson/30 blur-xl -z-10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <GlitchText intensity="high">
              {post.title}
            </GlitchText>
          </h1>

          <div className="flex flex-wrap items-center gap-4 font-terminal text-sm text-imperium-steel mb-6 pb-6 border-b border-imperium-steel-dark relative">
            <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-imperium-crimson shadow-[0_0_8px_rgba(154,17,21,0.8)]" />
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
              <span className="inline-flex items-center px-2 py-1 text-xs border border-imperium-crimson text-imperium-crimson relative">
                <motion.div
                  className="absolute inset-0 bg-imperium-crimson/20"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative z-10">{CATEGORY_LABELS[post.category.slug] || post.category.name}</span>
              </span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-imperium-steel-dark">
              <Tag className="h-3.5 w-3.5 text-imperium-steel-dark" />
              {post.tags.map((tag: string) => (
                <motion.span
                  key={tag}
                  className="font-terminal text-xs text-imperium-steel hover:text-imperium-crimson transition-colors cursor-default"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}

          {post.excerpt && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-4 mb-6 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-imperium-crimson/10 blur-2xl" />
              <p className="font-terminal italic text-imperium-steel relative z-10">{post.excerpt}</p>
            </div>
          )}

          <MarkdownContent content={post.content || ''} />
        </article>

        <div className="h-20" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 shrink-0 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-imperium-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
        <span className="font-terminal text-xs text-imperium-steel-dark">
          [SCROLL] Read more
        </span>
        {onClose ? (
          <button
            onClick={onClose}
            className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
          >
            [ESC] Close
          </button>
        ) : (
          <Link
            href="/blogs"
            className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
          >
            {'<'} Back to archives
          </Link>
        )}
      </div>

      {/* Bottom scanline */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent shadow-[0_0_10px_rgba(154,17,21,0.8)]"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ width: '30%' }}
        />
      </div>

      {/* CRT line effect */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-30">
        <div className="w-full h-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent_1px, rgba(154,17,21,0.1)_1px, rgba(154,17,21,0.1)_2px)',
        }} />
      </div>
    </div>
  );
}
