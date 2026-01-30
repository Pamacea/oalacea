'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react';
import { getPostBySlug } from '@/actions/blog';
import { useInWorldAdminStore } from '@/store/in-world-admin-store';

// Simple markdown renderer for basic content with proper React keys
function MarkdownRenderer({ content }: { content: string }) {
  const elements = useMemo(() => {
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
      processed = processed.replace(/`(.+?)`/g, '<code class="bg-amber-950/50 text-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-zinc-100 hover:text-amber-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
      return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        if (inCodeBlock) {
          result.push(
            <pre key={`code-${i}`} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 my-4 overflow-x-auto">
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

      if (line.startsWith('# ')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h2 key={`h2-${i}`} className="text-2xl font-bold text-zinc-100 mt-8 mb-4 first:mt-0">
            {processInline(line.substring(2))}
          </h2>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h3 key={`h3-${i}`} className="text-xl font-semibold text-zinc-100 mt-6 mb-3 first:mt-0">
            {processInline(line.substring(3))}
          </h3>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        result.push(
          <h4 key={`h4-${i}`} className="text-lg font-semibold text-amber-300 mt-4 mb-2 first:mt-0">
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
          result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
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
        result.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
        listItems = [];
        inList = false;
      }

      if (line.trim() === '') {
        result.push(<br key={`br-${i}`} />);
        continue;
      }

      if (line.trim() !== '') {
        result.push(
          <p key={`p-${i}`} className="text-zinc-300 leading-relaxed my-3">
            {processInline(line)}
          </p>
        );
      }
    }

    if (inList && listItems.length > 0) {
      result.push(<ul key={`ul-final`} className="list-disc list-inside space-y-2 my-4 text-zinc-300">{listItems}</ul>);
    }

    return result;
  }, [content]);

  return <>{elements}</>;
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
        <MarkdownRenderer content={post.content} />
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
