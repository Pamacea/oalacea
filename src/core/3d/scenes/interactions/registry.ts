// Registry des interactions - Structure déclarative pour toutes les interactions
// Chaque objet définit ici son interaction sans avoir à coder la logique

import type { WorldType } from '../types';

export type InteractionType = 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin';

export interface InteractionConfig {
  id: string;
  world: WorldType | 'both'; // Dans quel monde cette interaction existe
  position: [number, number, number];
  type: InteractionType;
  label: string;

  // Props selon le type
  targetWorld?: WorldType; // Pour type='portal'
  route?: string; // Pour type='route'
  dialogue?: string[]; // Pour type='dialogue'
  itemId?: string; // Pour type='pickup'

  // Configuration optionnelle
  radius?: number; // Rayon de détection (défaut: 3.5)
  disabled?: boolean; // Désactiver temporairement
}

/**
 * Registry centralisé de toutes les interactions
 *
 * Pour ajouter une interaction:
 * 1. Ajouter un objet dans ce tableau
 * 2. Le système l'enregistre automatiquement
 *
 * Plus besoin de modifier TopDownScene ou autres fichiers !
 */
export const INTERACTIONS_REGISTRY: InteractionConfig[] = [
  // =========================================
  // PORTAILS (Monde = both car présents dans les deux mondes)
  // =========================================
  {
    id: 'portal-to-art',
    world: 'dev',
    position: [0, 0, 0],
    type: 'portal',
    label: 'Underground',
    targetWorld: 'art',
    radius: 4,
  },
  {
    id: 'portal-to-dev',
    world: 'art',
    position: [0, 0, 0],
    type: 'portal',
    label: 'Imperium',
    targetWorld: 'dev',
    radius: 4,
  },

  // =========================================
  // ZONES DE CONTENU (Routes)
  // IMPORTANT: positions MUST match the actual 3D objects in DevWorld/ArtWorld
  // =========================================
  {
    id: 'zone-blog-dev',
    world: 'dev',
    position: [-12, 0, 12],
    type: 'route',
    label: 'Blog',
    route: '/blog',
    radius: 4,
  },
  {
    id: 'zone-blog-art',
    world: 'art',
    position: [-15, 0, 15],
    type: 'route',
    label: 'Blog',
    route: '/blog',
    radius: 4,
  },
  {
    id: 'zone-portfolio-dev',
    world: 'dev',
    position: [12, 0, 12],
    type: 'route',
    label: 'Portfolio',
    route: '/portfolio',
    radius: 4,
  },
  {
    id: 'zone-portfolio-art',
    world: 'art',
    position: [15, 0, 15],
    type: 'route',
    label: 'Portfolio',
    route: '/portfolio',
    radius: 4,
  },
  {
    id: 'zone-about-dev',
    world: 'dev',
    position: [0, 0, -8],
    type: 'route',
    label: 'About',
    route: '/about',
    radius: 4,
  },
  {
    id: 'zone-about-art',
    world: 'art',
    position: [0, 0, -8],
    type: 'route',
    label: 'About',
    route: '/about',
    radius: 4,
  },

  // =========================================
  // TERMINAUX ADMIN (Seulement visible si admin)
  // =========================================
  {
    id: 'admin-terminal-dev',
    world: 'dev',
    position: [8, 0, 8],
    type: 'admin',
    label: 'Admin Terminal',
    radius: 2.5,
  },
  {
    id: 'admin-terminal-art',
    world: 'art',
    position: [-8, 0, 8],
    type: 'admin',
    label: 'Admin Panel',
    radius: 2.5,
  },
];

/**
 * Récupère les interactions pour un monde donné
 */
export function getInteractionsForWorld(world: WorldType): InteractionConfig[] {
  return INTERACTIONS_REGISTRY.filter(
    interaction => interaction.world === world || interaction.world === 'both'
  );
}

/**
 * Récupère une interaction par son ID
 */
export function getInteractionById(id: string): InteractionConfig | undefined {
  return INTERACTIONS_REGISTRY.find(interaction => interaction.id === id);
}
