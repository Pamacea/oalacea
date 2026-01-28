import { create } from 'zustand';

type AdminView = 'dashboard' | 'posts' | 'projects' | 'edit-post' | 'edit-project' | 'read-post';

interface InWorldAdminState {
  isOpen: boolean;
  view: AdminView;
  selectedId?: string;
  openAdmin: (view?: AdminView, id?: string) => void;
  closeAdmin: () => void;
  setView: (view: AdminView, id?: string) => void;
}

export const useInWorldAdminStore = create<InWorldAdminState>((set) => ({
  isOpen: false,
  view: 'dashboard',
  openAdmin: (view = 'dashboard', id) => set({ isOpen: true, view, selectedId: id }),
  closeAdmin: () => set({ isOpen: false, view: 'dashboard', selectedId: undefined }),
  setView: (view, id) => set({ view, selectedId: id }),
}));
