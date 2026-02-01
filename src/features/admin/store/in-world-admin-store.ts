import { create } from 'zustand';

type AdminView = 'dashboard' | 'posts' | 'projects' | 'categories' | 'create-post' | 'create-project' | 'edit-post' | 'edit-project' | 'read-post' | null;

interface InWorldAdminState {
  isOpen: boolean;
  view: AdminView;
  selectedId: string | null;
  openAdmin: () => void;
  closeAdmin: () => void;
  setView: (view: AdminView) => void;
  setSelectedId: (id: string | null) => void;
}

export const useInWorldAdminStore = create<InWorldAdminState>((set) => ({
  isOpen: false,
  view: 'dashboard',
  selectedId: null,
  openAdmin: () => set({ isOpen: true }),
  closeAdmin: () => set({ isOpen: false, view: 'dashboard', selectedId: null }),
  setView: (view) => set({ view }),
  setSelectedId: (id) => set({ selectedId: id }),
}));
