import { create } from 'zustand';
import type { PostListItem } from '@/actions/blog/query';

interface BlogDocumentsState {
  posts: PostListItem[];
  currentPage: number;
  postsPerPage: number;
  totalPages: number;
  isLoading: boolean;
  activePost: PostListItem | null;
  terminalOpen: boolean;
  setPosts: (posts: PostListItem[]) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setTotalPages: (total: number) => void;
  setActivePost: (post: PostListItem | null) => void;
  setTerminalOpen: (open: boolean) => void;
  getCurrentPagePosts: () => PostListItem[];
  getPrevPost: (currentPost: PostListItem) => PostListItem | null;
  getNextPost: (currentPost: PostListItem) => PostListItem | null;
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
