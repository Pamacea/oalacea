'use client';

import { useState, useCallback, useMemo } from 'react';
import { BlogDocument } from './BlogDocument';
import { BlogTerminal } from './BlogTerminal';
import { usePosts } from '@/features/blog/queries';
import { BlogPostReader } from '@/features/3d-world/components/admin';

interface BlogDocumentsProps {
  world: 'DEV' | 'ART';
}

export function BlogDocuments({ world }: BlogDocumentsProps) {
  const { posts, isLoading } = usePosts();
  const [currentPage, setCurrentPage] = useState(0);
  const [activePost, setActivePost] = useState<typeof posts[0] | null>(null);
  const postsPerPage = 10;

  const currentPagePosts = posts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePostSelect = useCallback((post: any) => {
    setActivePost(post);
  }, []);

  const handleClose = useCallback(() => {
    setActivePost(null);
  }, []);

  const handleNext = useCallback((nextPost: any) => {
    setActivePost(nextPost);
  }, []);

  const handlePrevious = useCallback((prevPost: any) => {
    setActivePost(prevPost);
  }, []);

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

  if (isLoading) {
    return null;
  }

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
          postSlug={activePost.slug}
        />
      )}
    </>
  );
}
