'use client';

import { useEffect, useState, useCallback } from 'react';
import { BlogDocument } from './BlogDocument';
import { BlogTerminal } from './BlogTerminal';
import { useBlogDocumentsStore } from '@/store/blog-documents-store';
import type { Post } from '@/generated/prisma/client';
import { BlogPostReader } from '@/components/3d/BlogPostReader';
import { getPosts } from '@/actions/blog';

interface BlogDocumentsProps {
  world: 'DEV' | 'ART';
}

export function BlogDocuments({ world }: BlogDocumentsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const postsPerPage = 10;
  const { setActivePost: setStoreActivePost, getPrevPost, getNextPost } = useBlogDocumentsStore();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const result = await getPosts({ published: true });
        setPosts(result.posts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      }
    }
    fetchPosts();
  }, []);

  const currentPagePosts = posts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePostSelect = useCallback((post: Post) => {
    setActivePost(post);
    setStoreActivePost(post);
  }, [setStoreActivePost]);

  const handleClose = useCallback(() => {
    setActivePost(null);
    setStoreActivePost(null);
  }, [setStoreActivePost]);

  const handleNext = useCallback(() => {
    if (activePost) {
      const next = getNextPost(activePost);
      if (next) {
        setActivePost(next);
        setStoreActivePost(next);
      }
    }
  }, [activePost, getNextPost, setStoreActivePost]);

  const handlePrevious = useCallback(() => {
    if (activePost) {
      const prev = getPrevPost(activePost);
      if (prev) {
        setActivePost(prev);
        setStoreActivePost(prev);
      }
    }
  }, [activePost, getPrevPost, setStoreActivePost]);

  const getTerminalPosition = (): [number, number, number] => {
    if (world === 'DEV') {
      return [-20, 0, 0];
    }
    return [20, 0, 0];
  };

  const getDocumentPosition = (index: number): [number, number, number] => {
    const spacing = 4;
    const startOffset = ((currentPagePosts.length - 1) * spacing) / 2;

    if (world === 'DEV') {
      const angle = -Math.PI / 4 + (index / (currentPagePosts.length - 1 || 1)) * (Math.PI / 2);
      const radius = 15;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius - 10,
      ];
    } else {
      return [index * spacing - startOffset, 0, -20];
    }
  };

  return (
    <>
      {/* Blog Terminal - Main interaction point for blog posts */}
      {posts.length > 0 && (
        <BlogTerminal
          posts={posts}
          position={getTerminalPosition()}
          onPostSelect={handlePostSelect}
          activePostId={activePost?.id}
        />
      )}

      {/* Individual Blog Documents in the world */}
      {currentPagePosts.map((post, index) => (
        <BlogDocument
          key={post.id}
          post={post}
          position={getDocumentPosition(index)}
          world={world}
          isActive={activePost?.id === post.id}
          onInteract={() => handlePostSelect(post)}
        />
      ))}

      {/* Blog Post Reader Modal */}
      {activePost && (
        <BlogPostReader
          post={activePost}
          onClose={handleClose}
          onNext={posts.findIndex(p => p.id === activePost.id) < posts.length - 1 ? handleNext : undefined}
          onPrevious={posts.findIndex(p => p.id === activePost.id) > 0 ? handlePrevious : undefined}
        />
      )}
    </>
  );
}
