'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, Scroll, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPostBySlug, type PostDetail } from '@/actions/blog';
import { useInWorldAdminStore } from '@/features/admin/store';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

// Simple markdown renderer for basic content with proper React keys
function MarkdownRenderer({ content }: { content: string }) {
  const elements = (() => {
    if (!content) return [];

    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let inCodeBlock = false;
    let inList = false;
    let codeContent = '';
    let listItems: React.ReactNode[] = [];
    let listIndex = 0;

    const processInline = (text: string): React.ReactNode => {
      let processed = text;
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
      processed = processed.replace(/_(.+?)_/g, '<em>$1</em>');
      processed = processed.replace(/`(.+?)`/g, '<code class="bg-imperium-black border border-imperium-crimson text-imperium-bone px-2 py-1 text-sm font-mono">$1</code>');
      processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-imperium-gold hover:text-imperium-crimson underline" target="_blank" rel="noopener noreferrer">$1</a>');
      return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        if (inCodeBlock) {
          result.push(
            <pre key={`code-${i}`} className="border-2 border-imperium-steel-dark bg-imperium-black p-4 my-4 overflow-x-auto">
              <code className="text-sm text-imperium-teal font-mono whitespace-pre-wrap">{codeContent}</code>
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
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h2 key={`h2-${i}`} className="font-display text-2xl uppercase tracking-wider text-imperium-bone mt-8 mb-4 first:mt-0">
            {processInline(line.substring(2))}
          </h2>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h3 key={`h3-${i}`} className="font-display text-xl uppercase tracking-wider text-imperium-bone mt-6 mb-3 first:mt-0">
            {processInline(line.substring(3))}
          </h3>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h4 key={`h4-${i}`} className="font-display text-lg uppercase tracking-wider text-imperium-gold mt-4 mb-2 first:mt-0">
            {processInline(line.substring(4))}
          </h4>
        );
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
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
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
        result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
        listItems = [];
        inList = false;
      }

      if (line.trim() === '') {
        result.push(<br key={`br-${i}`} />);
        continue;
      }

      if (line.trim() !== '') {
        result.push(
          <p key={`p-${i}`} className="font-terminal text-imperium-steel leading-relaxed my-3">
            {processInline(line)}
          </p>
        );
      }
    }

    if (inList && listItems.length > 0) {
      result.push(<ul key={`ul-final`} className="list-disc list-inside space-y-2 my-4 text-imperium-steel">{listItems}</ul>);
    }

    return result;
  })();

  return <>{elements}</>;
}

export function BlogPostReader({ postSlug }: { postSlug: string }) {
  const { setView } = useInWorldAdminStore();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playHover, playClick } = useUISound();

  useEffect(() => {
    async function loadPost() {
      try {
        const result = await getPostBySlug(postSlug);
        setPost(result);
      } catch {
        // Error silently ignored
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [postSlug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4"
        >
          ⚙
        </motion.div>
        <p className="font-terminal text-imperium-steel">Loading archive data...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <Scroll className="h-16 w-16 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
        <p className="font-terminal text-imperium-steel mb-4">[ARCHIVE_NOT_FOUND]</p>
        <motion.button
          onMouseEnter={playHover}
          onClick={() => setView('posts')}
          className="inline-flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
        >
          Return to archives
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
        <motion.button
          onMouseEnter={playHover}
          onClick={() => {
            setView('posts');
            playClick();
          }}
          className="flex items-center gap-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone px-4 py-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="border-2 border-imperium-crimson bg-imperium-crimson/10 p-2">
            <Scroll className="h-5 w-5 text-imperium-crimson" />
          </div>
          <h2 className="font-display text-lg uppercase tracking-wider text-imperium-bone">DATA TERMINAL</h2>
        </div>
        <div className="w-6" />
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black relative">
          <Image src={post.coverImage} alt={post.title} width={800} height={450} className="w-full h-full object-cover" unoptimized />
          <div className="absolute inset-0 border border-imperium-crimson/20 pointer-events-none" />
        </div>
      )}

      {/* Title */}
      <div className="space-y-4 border-b-2 border-imperium-steel-dark pb-6">
        <h1 className="font-display text-4xl uppercase tracking-widest text-imperium-bone">
          <GlitchText intensity="high">
            {post.title}
          </GlitchText>
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 font-terminal text-sm text-imperium-steel">
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
            {post.readingTime || Math.ceil(post.content.length / 1000)} MIN READ
          </span>
          {post.category && (
            <span className="inline-flex items-center px-2 py-1 text-xs border border-imperium-crimson text-imperium-crimson">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-imperium-steel-dark" />
            {post.tags.map((tag: string) => (
              <span key={tag} className="font-terminal text-xs text-imperium-steel hover:text-imperium-crimson transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-4">
          <p className="font-terminal text-imperium-italic italic text-imperium-steel">{'>'} {post.excerpt}</p>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert prose prose-invert max-w-none">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t-2 border-imperium-steel-dark pt-6">
        <motion.a
          onMouseEnter={playHover}
          href={`/blogs/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-terminal text-sm border-2 border-imperium-gold bg-imperium-gold/10 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          VIEW ON SITE
        </motion.a>
        <motion.button
          onMouseEnter={playHover}
          onClick={() => setView('posts')}
          className="font-terminal text-sm text-imperium-steel hover:text-imperium-bone transition-colors"
        >
          [ESC] CLOSE
        </motion.button>
      </div>
    </div>
  );
}
