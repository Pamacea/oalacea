import { create } from 'zustand';
import type { Post } from '@/generated/prisma/client';

interface BlogDocumentsState {
  posts: Post[];
  currentPage: number;
  postsPerPage: number;
  totalPages: number;
  isLoading: boolean;
  activePost: Post | null;
  terminalOpen: boolean;
  setPosts: (posts: Post[]) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setTotalPages: (total: number) => void;
  setActivePost: (post: Post | null) => void;
  setTerminalOpen: (open: boolean) => void;
  getCurrentPagePosts: () => Post[];
  getPrevPost: (currentPost: Post) => Post | null;
  getNextPost: (currentPost: Post) => Post | null;
}

export const useBlogDocumentsStore = create<BlogDocumentsState>((set, get) => ({
  posts: [],
  currentPage: 1,
  postsPerPage: 10,
  totalPages: 1,
  isLoading: false,
  activePost: null,
  terminalOpen: false,

  setPosts: (posts) => set({ posts }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
  setTotalPages: (total) => set({ totalPages: total }),
  setActivePost: (post) => set({ activePost: post }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),

  getCurrentPagePosts: () => {
    const { posts, currentPage, postsPerPage } = get();
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    return posts.slice(start, end);
  },

  getPrevPost: (currentPost) => {
    const { posts } = get();
    const index = posts.findIndex(p => p.id === currentPost.id);
    return index > 0 ? posts[index - 1] : null;
  },

  getNextPost: (currentPost) => {
    const { posts } = get();
    const index = posts.findIndex(p => p.id === currentPost.id);
    return index < posts.length - 1 ? posts[index + 1] : null;
  },
}));
