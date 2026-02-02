# Oalacea - Guide du Projet

Portfolio/blog professionnel avec scène 3D interactive en vue isométrique.

---

## Vue d'ensemble

**Oalacea** est un site portfolio/blog qui se distingue par son expérience 3D interactive. Le visiteur peut contrôler un personnage dans un monde isométrique, naviguer entre différents environnements (Dev World, Art World), et interagir avec des zones déclenchant des contenus.

### Fonctionnalités principales

- **Scène 3D isométrique** avec personnage contrôlable
- **Pathfinding A*** intelligent pour éviter les obstacles
- **Système de collision** par zones circulaires
- **Blog CMS** avec Prisma + PostgreSQL (Supabase)
- **Authentification** NextAuth.js
- **Mode sombre/clair** avec thèmes dynamiques par monde
- **Analytics** temps de lecture et interactions

---

## Stack Technique

| Catégorie | Technologies |
|-----------|---------------|
| **Framework** | Next.js 16, App Router, React Server Components |
| **UI** | React 19, TypeScript, Tailwind CSS 4, Radix UI (shadcn/ui) |
| **State** | Zustand (client), TanStack Query (server) |
| **3D** | Three.js, React Three Fiber, Drei |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js v5 beta |
| **Forms** | React Hook Form, Zod validation |

---

## Structure du Projet

```
src/
├── app/                      # App Router (routing ONLY)
│   ├── (mie)/                # Route group: pages principales
│   │   ├── blogs/            # Blog pages
│   │   ├── page.tsx          # Homepage (3D scene)
│   │   └── layout.tsx        # Layout principal
│   └── api/                  # API Routes (webhooks uniquement)
│
├── features/                 # Modules métier (auto-contenus)
│   ├── 3d-world/            # Logique 3D (contrôles, store, hooks)
│   ├── auth/                # Authentification (hooks, components)
│   ├── blog/                # Blog (actions, components, queries)
│   └── portfolio/           # Portfolio (actions, components)
│
├── core/                     # Coeur technique (infrastructure)
│   ├── 3d/                  # Moteur 3D
│   │   ├── scenes/          # Scènes, collisions, pathfinding
│   │   ├── character/       # Personnage, contrôles
│   │   ├── camera/          # Caméra follow/free
│   │   ├── physics/         # Moteur physique, hitboxes
│   │   └── analytics/       # Tracking interactions
│   ├── auth/                # Configuration NextAuth
│   └── errors/              # Gestion des erreurs
│
├── shared/                   # Code partagé (utilisé par 2+ features)
│   ├── components/ui/       # Composants UI génériques
│   ├── hooks/               # Hooks partagés
│   └── utils/               # Utilitaires purs
│
├── config/                   # Configuration
│   ├── 3d/                  # Config mondes, audio, physics
│   ├── theme/               # Thèmes couleur
│   └── constants.ts         # Constantes globales
│
├── actions/                  # Server Actions (mutations)
├── lib/                      # Utilitaires et librairies
├── types/                    # Types TypeScript globaux
└── components/               # Composants partagés (layout, theme)
```

### Règle d'organisation

```
Est-ce utilisé par une seule feature ?
├── OUI → features/[feature]/
│         └── C'est un component ? → components/
│         └── C'est un hook ?      → hooks/
│         └── C'est un appel API ? → actions/
│         └── C'est du state ?     → store/
│
└── NON (utilisé par 2+ features)
    └── C'est un component UI ? → shared/components/ui/
    └── C'est un hook utilitaire ? → shared/hooks/
    └── C'est une pure function ?  → shared/utils/
```

---

## Règles de Développement

### 1. Imports et Chemins

```typescript
// 1. External dependencies
import { useState } from 'react'
import { z } from 'zod'

// 2. Internal shared (absolute imports)
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/utils/cn'

// 3. Feature imports (via barrel)
import { useAuth } from '@/features/auth'
import { BlogPostList } from '@/features/blog'

// 4. Types
import type { User } from '@/types'

// 5. Styles (si nécessaire)
import './Component.css'
```

**Barrel exports** (`index.ts` dans chaque dossier) :
- Un fichier `index.ts` par dossier
- Exporte uniquement le nécessaire (pas de composants internes)
- Permet des imports propres: `from '@/features/blog'` au lieu de `from '@/features/blog/components/BlogPostList'`

### 2. State Management

```typescript
// Server State (données asynchrones)
const { data: posts } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})

// Client State (UI temporaire)
const [isOpen, setIsOpen] = useState(false)

// Global State (Zustand - slices atomiques)
const { character } = useCharacterStore()
```

### 3. Styling Tailwind

```tsx
// ✅ CORRECT - gap sur le parent
<div className="flex gap-4">
  <Item />
  <Item />
</div>

// ❌ FAUX - margin sur les enfants
<div className="flex">
  <Item className="mr-4" />  {/* Éviter */}
  <Item />
</div>
```

**Autres règles UI** :
- Utiliser `slate-950` au lieu de `black` (#000000)
- Préférer `w-1/2` ou `max-w-[60%]` au lieu de `max-w-xl/2xl/3xl`
- Couleurs: `text-slate-900` (titres), `text-slate-500` (meta)

### 4. Validation

```typescript
import { z } from 'zod'

// Schéma de validation
const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
})

// Parsing (lance si invalide)
const validated = postSchema.parse(input)
```

### 5. Server Actions

```typescript
// actions/blog/create-post.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/prisma'

export async function createPost(input: CreatePostInput) {
  const validated = createPostSchema.parse(input)

  const post = await db.post.create({ data: validated })
  revalidatePath('/blog')

  return post
}
```

---

## Contrôles 3D

| Contrôle | Action |
|----------|--------|
| **Clic droit** | Déplacer le personnage vers le curseur |
| **Z Q S D / W A S D** | Déplacement directionnel |
| **Shift** | Sprint |
| **E** | Interagir avec les zones proches |
| **Espace** | Toggle caméra follow/free |

### Architecture 3D

```
core/3d/
├── scenes/
│   ├── TopDownScene.tsx       # Scène principale
│   ├── collisions.ts          # Collision par zones circulaires
│   ├── pathfinding/           # Algorithme A*
│   ├── portals/               # Système de portail
│   └── worlds/                # Dev World & Art World
├── character/
│   ├── Character.tsx          # Modèle 3D du personnage
│   ├── CharacterControls.ts   # Gestion des entrées clavier/souris
│   └── CharacterModel.tsx     # Geometry et materials
├── camera/
│   └── FollowCamera.tsx       # Caméra isométrique avec lissage
└── physics/
    ├── engine/                # Moteur physique, hitboxes
    └── config/                # Configuration obstacles
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Accueil avec scène 3D |
| `/about` | À propos |
| `/portfolio` | Portfolio |
| `/blog` | Blog (liste + détail) |
| `/blog/[slug]` | Article de blog |
| `/contact` | Contact |
| `/login` | Connexion |
| `/register` | Inscription |
| `/admin` | Admin dashboard |

---

## Database (Prisma + Supabase)

### Connection URLs

- **App prod** (avec pgbouncer): `DATABASE_URL` avec `:6543` et `pgbouncer=true`
- **Migrations** (direct): `POSTGRES_URL_NON_POOLING` avec `:5432` sans pgbouncer

### Important: Migrations

```bash
# Pour prisma db push, TOUJOURS utiliser l'URL directe
# car pgbouncer ne supporte pas les prepared statements

# Créer un .env temporaire avec:
DATABASE_URL="postgres://...:5432/postgres?sslmode=require"

# Puis:
npx prisma db push
```

### Schéma

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Scripts Disponibles

```bash
pnpm dev              # Développement (localhost:3000)
pnpm build            # Build production
pnpm start            # Serveur production
pnpm lint             # ESLint
pnpm typecheck        # Vérification TypeScript
pnpm db:generate      # Générer Prisma Client
pnpm db:push          # Pousser le schéma vers la DB
pnpm db:migrate       # Créer une migration
pnpm db:studio        # Ouvrir Prisma Studio
pnpm db:seed          # Seeding de la base
```

---

## Conventions de Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | `PascalCase.tsx` | `UserProfile.tsx` |
| Utilitaires | `camelCase.ts` | `formatDate.ts` |
| Types | `PascalCase.types.ts` | `User.types.ts` |
| Hooks | `useCamelCase.ts` | `useAuth.ts` |
| Server Actions | `kebab-case.ts` | `create-user.ts` |
| Dossiers | `kebab-case` | `user-management/` |

### Variables

```typescript
const MAX_RETRIES = 3           // UPPER_SNAKE_CASE (constantes)
const getUserData = () => {}    // camelCase (fonctions)
const isLoading = false         // camelCase (variables)
interface UserProfile {}        // PascalCase (types/interfaces)
const hasPermission = true      // is/has/should (booléens)
```

---

## Commit Message Format

```
<type>(<scope>): <subject>

<body>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

**Exemple**:
```
feat(blog): add rich text editor with TipTap

- Add TipTap integration
- Add toolbar with formatting options
- Add markdown export support

Closes #123
```

---

## Contact

- **Email**: oalacea@oalacea.fr
- **GitHub**: https://github.com/oalacea

---

*Document généré pour Oalacea - Portfolio 3D Interactif*
