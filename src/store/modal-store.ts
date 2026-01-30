import { create } from 'zustand';
import { useInWorldAdminStore } from './in-world-admin-store';

type ModalType = 'blog-listing' | 'project-listing' | 'about-listing' | 'admin-listing' | null;

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  openBlogListing: () => void;
  openProjectListing: () => void;
  openAboutListing: () => void;
  openAdminListing: () => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: null,
  openBlogListing: () => set({ isOpen: true, type: 'blog-listing' }),
  openProjectListing: () => set({ isOpen: true, type: 'project-listing' }),
  openAboutListing: () => set({ isOpen: true, type: 'about-listing' }),
  openAdminListing: () => {
    useInWorldAdminStore.getState().openAdmin();
    set({ isOpen: true, type: 'admin-listing' });
  },
  close: () => {
    const state = get();
    if (state.type === 'admin-listing') {
      useInWorldAdminStore.getState().closeAdmin();
    }
    set({ isOpen: false, type: null });
  },
}));
