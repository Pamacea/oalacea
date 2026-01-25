// Project store for portfolio projects
import { create } from 'zustand';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  thumbnail?: string;
  githubUrl?: string;
  liveUrl?: string;
  year: number;
  category: 'web' | 'mobile' | '3d' | 'ai' | 'other';
  worldPosition?: {
    world: 'dev' | 'art';
    x: number;
    z: number;
  };
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectBySlug: (slug: string) => Project | undefined;
  getProjectsByCategory: (category: Project['category']) => Project[];
}

// Sample projects data
const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'oalacea',
    title: 'Oalacea 3D Portfolio',
    slug: 'oalacea',
    description: 'Portfolio interactif 3D avec Three.js et React Three Fiber',
    longDescription: 'Un portfolio unique utilisant la 3D isométrique pour présenter mes projets de manière immersive. Technologies: Next.js 16, React 19, Three.js, Prisma, TypeScript.',
    techStack: ['Next.js', 'React Three Fiber', 'Three.js', 'Prisma', 'TypeScript', 'Tailwind'],
    githubUrl: 'https://github.com/Pamacea/oalacea',
    liveUrl: 'https://oalacea.com',
    year: 2025,
    category: '3d',
    worldPosition: { world: 'dev', x: 15, z: 10 },
  },
  {
    id: 'ecommerce-platform',
    title: 'E-Commerce Platform',
    slug: 'ecommerce-platform',
    description: 'Plateforme e-commerce complète avec paiement et gestion des stocks',
    longDescription: 'Architecture micro-services avec Next.js, Stripe pour les paiements, et Prisma pour la base de données.',
    techStack: ['Next.js', 'Stripe', 'Prisma', 'PostgreSQL', 'Redis', 'Docker'],
    year: 2024,
    category: 'web',
    worldPosition: { world: 'dev', x: -15, z: 15 },
  },
  {
    id: 'mobile-app',
    title: 'Task Manager App',
    slug: 'task-manager-app',
    description: 'Application mobile de gestion de tâches avec synchronisation offline',
    longDescription: 'React Native avec Expo, synchronisation locale avec SQLite, backend Node.js.',
    techStack: ['React Native', 'Expo', 'SQLite', 'Node.js', 'Fastify'],
    year: 2024,
    category: 'mobile',
    worldPosition: { world: 'art', x: 12, z: -18 },
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chat Assistant',
    slug: 'ai-chatbot',
    description: 'Chatbot IA avec intégration OpenAI et interface en temps réel',
    longDescription: 'Système de chat intelligent utilisant l\'API OpenAI, avec WebSocket pour les réponses en streaming.',
    techStack: ['Node.js', 'OpenAI API', 'WebSocket', 'React', 'MongoDB'],
    year: 2023,
    category: 'ai',
    worldPosition: { world: 'art', x: -18, z: 12 },
  },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: SAMPLE_PROJECTS,
  selectedProject: null,

  setSelectedProject: (project) => set({ selectedProject: project }),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getProjectBySlug: (slug) => get().projects.find((p) => p.slug === slug),

  getProjectsByCategory: (category) => get().projects.filter((p) => p.category === category),
}));

// Selectors
export const selectAllProjects = (state: ProjectState) => state.projects;
export const selectSelectedProject = (state: ProjectState) => state.selectedProject;
