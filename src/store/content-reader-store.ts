import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ContentType = 'blog' | 'project';

interface ContentItem {
  id: string;
  slug?: string;
  title: string;
  [key: string]: any;
}

interface ReadingHistoryItem {
  type: ContentType;
  id: string;
  timestamp: number;
}

interface ContentReaderState {
  // Current reading state
  isOpen: boolean;
  contentType: ContentType | null;
  contentId: string | null;
  contentData: ContentItem | null;

  // Navigation
  currentIndex: number;
  allItems: ContentItem[];

  // History
  readingHistory: ReadingHistoryItem[];

  // Actions
  openBlog: (slug: string, content?: ContentItem, allPosts?: ContentItem[]) => void;
  openProject: (slug: string, content?: ContentItem, allProjects?: ContentItem[]) => void;
  close: () => void;
  setContent: (content: ContentItem) => void;

  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  setAllItems: (items: ContentItem[]) => void;

  // History
  clearHistory: () => void;
}

export const useContentReaderStore = create<ContentReaderState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      contentType: null,
      contentId: null,
      contentData: null,
      currentIndex: 0,
      allItems: [],
      readingHistory: [],

      openBlog: (slug, content, allPosts = []) => {
        const items = allPosts.length > 0 ? allPosts : [];
        const index = items.findIndex((p) => p.slug === slug);

        set({
          isOpen: true,
          contentType: 'blog',
          contentId: slug,
          contentData: content ?? null,
          allItems: items,
          currentIndex: index >= 0 ? index : 0,
        });

        // Add to history
        const history = get().readingHistory;
        const updatedHistory = history.filter((h) => !(h.type === 'blog' && h.id === slug));
        updatedHistory.unshift({ type: 'blog', id: slug, timestamp: Date.now() });
        if (updatedHistory.length > 50) updatedHistory.pop();
        set({ readingHistory: updatedHistory });
      },

      openProject: (slug, content, allProjects = []) => {
        const items = allProjects.length > 0 ? allProjects : [];
        const index = items.findIndex((p) => p.slug === slug);

        set({
          isOpen: true,
          contentType: 'project',
          contentId: slug,
          contentData: content ?? null,
          allItems: items,
          currentIndex: index >= 0 ? index : 0,
        });

        // Add to history
        const history = get().readingHistory;
        const updatedHistory = history.filter((h) => !(h.type === 'project' && h.id === slug));
        updatedHistory.unshift({ type: 'project', id: slug, timestamp: Date.now() });
        if (updatedHistory.length > 50) updatedHistory.pop();
        set({ readingHistory: updatedHistory });
      },

      close: () => set({ isOpen: false, contentType: null, contentId: null, contentData: null }),

      setContent: (content) => set({ contentData: content }),

      goToNext: () => {
        const { currentIndex, allItems, contentType } = get();
        if (currentIndex < allItems.length - 1) {
          const nextItem = allItems[currentIndex + 1];
          const slug = nextItem.slug ?? nextItem.id;
          if (contentType === 'blog') {
            get().openBlog(slug, nextItem, allItems);
          } else if (contentType === 'project') {
            get().openProject(slug, nextItem, allItems);
          }
        }
      },

      goToPrevious: () => {
        const { currentIndex, allItems, contentType } = get();
        if (currentIndex > 0) {
          const prevItem = allItems[currentIndex - 1];
          const slug = prevItem.slug ?? prevItem.id;
          if (contentType === 'blog') {
            get().openBlog(slug, prevItem, allItems);
          } else if (contentType === 'project') {
            get().openProject(slug, prevItem, allItems);
          }
        }
      },

      setAllItems: (items) => set({ allItems: items }),

      clearHistory: () => set({ readingHistory: [] }),
    }),
    {
      name: 'content-reader-storage',
      partialize: (state) => ({
        readingHistory: state.readingHistory,
        // Don't persist isOpen and current reading state
      }),
    },
  )
);
