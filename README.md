# Oalacea

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/Pamacea/oalacea)](https://github.com/Pamacea/oalacea/releases/latest)
[![CI](https://github.com/Pamacea/oalacea/actions/workflows/ci.yml/badge.svg)](https://github.com/Pamacea/oalacea/actions)



Portfolio/blog professionnel avec scène 3D interactive en vue isométrique.

## Stack Technique

| Catégorie | Technologies |
|----------|---------------|
| **Framework** | Next.js 16, App Router |
| **UI** | React 19, TypeScript, Tailwind CSS 4, Shadcn UI |
| **State** | Zustand, TanStack Query |
| **3D** | Three.js, React Three Fiber |
| **Database** | PostgreSQL, Prisma |
| **Auth** | NextAuth.js |

## Démarrage

```bash
pnpm install
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Contrôles 3D

- **Clic droit** : Déplacer le personnage
- **Z Q S D / W A S D** : Déplacement directionnel
- **Shift** : Sprint
- **E** : Interagir avec les zones proches
- **Espace** : Toggle caméra follow/free

## Architecture 3D

```
src/core/3d/
├── scenes/
│   ├── TopDownScene.tsx       # Scène principale
│   ├── collisions.ts          # Système de collision circulaire
│   ├── pathfinding/           # Pathfinding A*
│   └── worlds/                # Dev World & Art World
├── character/
│   ├── Character.tsx
│   ├── CharacterControls.ts   # Contrôles + A*
│   └── CharacterModel.tsx
└── camera/
    └── FollowCamera.tsx
```

## Fonctionnalités 3D

- **Personnage contrôlable** avec rotation automatique
- **Pathfinding A*** intelligent pour éviter les obstacles
- **Collision** par zones circulaires
- **Caméra follow/free** avec lissage
- **Détection de proximité** pour interactions
- **Deux mondes** : Dev (cyberpunk) et Art (minimaliste)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Accueil avec scène 3D |
| `/about` | À propos |
| `/portfolio` | Portfolio |
| `/blog` | Blog |
| `/contact` | Contact |
| `/login` | Connexion |
| `/register` | Inscription |

## Scripts

```bash
pnpm dev         # Développement
pnpm build       # Build production
pnpm start       # Serveur production
pnpm lint        # ESLint
pnpm typecheck   # Vérification TypeScript
```

© 2025 Oalacea
