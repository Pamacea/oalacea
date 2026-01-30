import { useEffect } from 'react';
import { useBlogDocumentsStore } from '@/features/blog/store';
import { getPosts } from '@/actions/blog';

export function useBlogDocuments() {
  const { posts, setPosts, setTotalPages, postsPerPage, isLoading, setLoading } =
    useBlogDocumentsStore();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const result = await getPosts({ published: true });
        setPosts(result.posts);
        setTotalPages(Math.ceil(result.pagination.total / postsPerPage));
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [setPosts, setTotalPages, postsPerPage, setLoading]);

  return {
    posts,
    isLoading,
  };
}
