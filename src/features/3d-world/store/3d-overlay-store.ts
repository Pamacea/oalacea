// src/store/3d-overlay-store.ts
// Store pour gérer l'overlay qui affiche le contenu des pages au-dessus de la scène 3D

import { create } from 'zustand';

interface OverlayState {
  /** L'overlay est-il ouvert ? */
  isOpen: boolean;
  /** Route actuellement affichée dans l'overlay */
  currentRoute: string | null;
  /** Contenu HTML de la page */
  content: string;
  /** Titre de la page */
  title: string;
  /** Ouvrir l'overlay avec une route */
  openOverlay: (route: string, title?: string) => Promise<void>;
  /** Fermer l'overlay */
  closeOverlay: () => void;
  /** Définir le contenu */
  setContent: (content: string, title: string) => void;
  /** Charger le contenu d'une route */
  loadRoute: (route: string) => Promise<void>;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  isOpen: false,
  currentRoute: null,
  content: '',
  title: '',

  openOverlay: async (route, title) => {
    set({ isOpen: true, currentRoute: route });

    try {
      // Fetch le contenu de la page
      const response = await fetch(route, {
        headers: {
          'X-Overlay-Request': 'true', // Header pour identifier les requêtes overlay
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${route}: ${response.statusText}`);
      }

      const html = await response.text();

      // Extraire le contenu principal de la page
      // On cherche le <main> ou un contenu avec id="content"
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const mainContent = doc.querySelector('main') || doc.querySelector('#content') || doc.body;

      // Nettoyer - enlever les scripts et les éléments non nécessaires
      const clonedContent = mainContent.cloneNode(true) as Element;

      // Supprimer les scripts
      clonedContent.querySelectorAll('script').forEach((el: Element) => el.remove());

      // Supprimer les meta tags non nécessaires
      clonedContent.querySelectorAll('meta').forEach((el: Element) => el.remove());

      set({
        content: clonedContent.innerHTML,
        title: title || doc.title || 'Page',
      });
    } catch (error) {
      console.error('Failed to load overlay content:', error);
      set({
        content: `<div class="p-8 text-white">
          <h2 class="text-xl font-bold mb-4">Erreur de chargement</h2>
          <p>Impossible de charger le contenu de la page.</p>
          <button onclick="window.location.href='${route}'" class="mt-4 px-4 py-2 bg-white/10 rounded hover:bg-white/20">
            Ovrir dans une nouvelle page
          </button>
        </div>`,
        title: 'Erreur',
      });
    }
  },

  closeOverlay: () => {
    set({ isOpen: false, currentRoute: null, content: '', title: '' });
  },

  setContent: (content, title) => {
    set({ content, title });
  },

  loadRoute: async (route) => {
    await get().openOverlay(route);
  },
}));

// Selectors optimisés
export const selectOverlayState = (state: OverlayState) => ({
  isOpen: state.isOpen,
  currentRoute: state.currentRoute,
  title: state.title,
});
