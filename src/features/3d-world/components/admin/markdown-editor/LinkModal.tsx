'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Search, ExternalLink, FileText, Folder, Hash, Loader2, AlertCircle } from 'lucide-react';
import { type LinkOption } from './types';
import { usePosts } from '@/features/blog/queries/usePosts';
import { useProjects } from '@/features/portfolio/queries/useProjects';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (link: LinkOption) => void;
  initialUrl?: string;
}

// URL validation - only allow safe protocols
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export function LinkModal({ isOpen, onClose, onInsert, initialUrl = '' }: LinkModalProps) {
  const [tab, setTab] = useState<'external' | 'blog' | 'project'>('external');
  const [url, setUrl] = useState(initialUrl);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts using server action + TanStack Query
  const { posts: blogPosts, isLoading: isLoadingBlogs } = usePosts({ limit: 20, published: true });

  // Fetch projects using server action + TanStack Query (no limit option in this query)
  const { projects, isLoading: isLoadingProjects } = useProjects();

  // Transform blog posts to simpler format
  const blogs = useMemo(() =>
    blogPosts.map(p => ({ id: p.id, title: p.title, slug: p.slug })),
    [blogPosts]
  );

  const isLoading = tab === 'blog' ? isLoadingBlogs : isLoadingProjects;

  const urlError = useMemo(() => {
    if (tab === 'external' && url && !isValidUrl(url)) {
      return 'Invalid URL. Only http, https, mailto, and tel are allowed.';
    }
    return null;
  }, [tab, url]);

  // Reset search query when tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery('');
  }, [tab]);

  const handleInsert = () => {
    if (tab === 'external' && url) {
      if (!isValidUrl(url)) {
        return; // Don't insert invalid URLs
      }
      onInsert({ type: 'external', url });
    } else if (tab === 'blog') {
      const selected = blogs.find(b => b.slug === searchQuery || b.id === searchQuery);
      if (selected) {
        onInsert({ type: 'blog', url: `/blog/${selected.slug}`, title: selected.title, id: selected.id });
      }
    } else if (tab === 'project') {
      const selected = projects.find(p => p.slug === searchQuery || p.id === searchQuery);
      if (selected) {
        onInsert({ type: 'project', url: `/projects/${selected.slug}`, title: selected.title, id: selected.id });
      }
    }
    onClose();
    reset();
  };

  const reset = () => {
    setUrl('');
    setSearchQuery('');
  };

  if (!isOpen) return null;

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-sm border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h3 className="text-lg font-medium text-zinc-100">Insert Link</h3>
          <button
            onClick={onClose}
            className="rounded-sm p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setTab('external')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'external'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ExternalLink className="h-4 w-4" />
            External
          </button>
          <button
            onClick={() => setTab('blog')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'blog'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Blog Post
          </button>
          <button
            onClick={() => setTab('project')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'project'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Folder className="h-4 w-4" />
            Project
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {tab === 'external' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full bg-zinc-900 border rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
                    urlError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-zinc-700 focus:ring-blue-500/50 focus:border-blue-500'
                  }`}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && !urlError && handleInsert()}
                />
                {urlError && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {urlError}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'blog' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-sm pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
                  </div>
                ) : filteredBlogs.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">No blog posts found</p>
                ) : (
                  filteredBlogs.map((blog) => (
                    <button
                      key={blog.id}
                      onClick={() => {
                        onInsert({
                          type: 'blog',
                          url: `/blog/${blog.slug}`,
                          title: blog.title,
                          id: blog.id,
                        });
                        onClose();
                        reset();
                      }}
                      className="w-full flex items-start gap-3 p-3 rounded-sm hover:bg-zinc-900 transition-colors text-left"
                    >
                      <Hash className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{blog.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'project' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-sm pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">No projects found</p>
                ) : (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onInsert({
                          type: 'project',
                          url: `/projects/${project.slug}`,
                          title: project.title,
                          id: project.id,
                        });
                        onClose();
                        reset();
                      }}
                      className="w-full flex items-start gap-3 p-3 rounded-sm hover:bg-zinc-900 transition-colors text-left"
                    >
                      <Folder className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{project.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={tab === 'external' ? !url : !searchQuery}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}
