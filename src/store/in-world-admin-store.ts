import { create } from 'zustand';

type AdminView = 'dashboard' | 'posts' | 'projects' | 'edit-post' | 'edit-project' | 'read-post';
type WorldFilter = 'all' | 'DEV' | 'ART';

interface InWorldAdminState {
  isOpen: boolean;
  view: AdminView;
  selectedId?: string;
  worldFilter: WorldFilter;
  openAdmin: (view?: AdminView, id?: string) => void;
  closeAdmin: () => void;
  setView: (view: AdminView, id?: string) => void;
  setWorldFilter: (filter: WorldFilter) => void;
}

export const useInWorldAdminStore = create<InWorldAdminState>((set) => ({
  isOpen: false,
  view: 'dashboard',
  worldFilter: 'all',
  openAdmin: (view = 'dashboard', id) => set({ isOpen: true, view, selectedId: id }),
  closeAdmin: () => set({ isOpen: false, view: 'dashboard', selectedId: undefined, worldFilter: 'all' }),
  setView: (view, id) => set({ view, selectedId: id }),
  setWorldFilter: (filter) => set({ worldFilter: filter }),
}));
