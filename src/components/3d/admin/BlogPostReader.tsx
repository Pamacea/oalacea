'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react';
import { getPostBySlug } from '@/actions/blog';
import { useInWorldAdminStore } from '@/store/in-world-admin-store';
import { IMPERIUM } from '@/config/theme/imperium';

// Simple markdown renderer for basic content
function renderMarkdown(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  const processInline = (text: string): React.ReactNode => {
    // Bold **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic *text* or _text_
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');
    // Code `text`
    text = text.replace(/`(.+?)`/g, '<code class="bg-amber-950/50 text-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    // Links [text](url)
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-zinc-100 hover:text-amber-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  let inCodeBlock = false;
  let inList = false;
  let codeContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={key++} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 my-4 overflow-x-auto">
            <code className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">{codeContent}</code>
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

    // Headers
    if (line.startsWith('# ')) {
      if (inList) {
        elements.push(<br key={key++} />);
        inList = false;
      }
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-zinc-100 mt-8 mb-4 first:mt-0">
          {processInline(line.substring(2))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        elements.push(<br key={key++} />);
        inList = false;
      }
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-zinc-100 mt-6 mb-3 first:mt-0">
          {processInline(line.substring(3))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      if (inList) {
        elements.push(<br key={key++} />);
        inList = false;
      }
      elements.push(
        <h4 key={key++} className="text-lg font-semibold text-amber-300 mt-4 mb-2 first:mt-0">
          {processInline(line.substring(4))}
        </h4>
      );
      continue;
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        elements.push(<ul key={key++} className="list-disc list-inside space-y-2 my-4 text-zinc-300" />);
        inList = true;
      }
      const lastUl = elements[elements.length - 1] as any;
      if (lastUl && lastUl.type === 'ul') {
        const newItems = [...(lastUl.props.children || []), <li key={key++}>{processInline(line.trim().substring(2))}</li>];
        elements[elements.length - 1] = <ul key={elements.length - 1} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{newItems}</ul>;
      }
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line.trim())) {
      if (!inList) {
        elements.push(<ol key={key++} className="list-decimal list-inside space-y-2 my-4 text-zinc-300" />);
        inList = true;
      }
      const lastOl = elements[elements.length - 1] as any;
      if (lastOl && lastOl.type === 'ol') {
        const newItems = [...(lastOl.props.children || []), <li key={key++}>{processInline(line.trim().replace(/^\d+\.\s/, ''))}</li>];
        elements[elements.length - 1] = <ol key={elements.length - 1} className="list-decimal list-inside space-y-2 my-4 text-zinc-300">{newItems}</ol>;
      }
      continue;
    }

    // End list on empty line or non-list item
    if (inList && line.trim() !== '') {
      inList = false;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={key++} />);
      continue;
    }

    // Paragraph
    if (line.trim() !== '') {
      elements.push(
        <p key={key++} className="text-zinc-300 leading-relaxed my-3">
          {processInline(line)}
        </p>
      );
    }
  }

  return elements;
}

export function BlogPostReader({ postSlug }: { postSlug: string }) {
  const { setView } = useInWorldAdminStore();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const result = await getPostBySlug(postSlug);
        setPost(result);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [postSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 text-sm">Chargement...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Article non trouvé</p>
        <button
          onClick={() => setView('posts')}
          className="mt-4 text-zinc-400 hover:text-zinc-300"
        >
          Retour aux articles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('posts')}
          className="flex items-center gap-2 text-sm border border-zinc-700 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <h2 className="text-lg font-bold text-zinc-100">Lecture</h2>
        <div className="w-6" />
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
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
            {post.readingTime || Math.ceil(post.content.length / 1000)} min
          </span>
          {post.category && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-zinc-100">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-zinc-500" />
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="text-zinc-300 italic">{post.excerpt}</p>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert prose prose-invert max-w-none">
        {renderMarkdown(post.content)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-zinc-100 hover:text-amber-300 transition-colors"
        >
          <Eye className="h-4 w-4" />
          Voir sur le site
        </a>
        <button
          onClick={() => setView('posts')}
          className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
