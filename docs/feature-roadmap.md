# Feature Roadmap - Oalacea 3D Portfolio

## 🎯 Top 5 Features Prioritaires

---

## 🥇 #1: Headless CMS + Blog In-World

**Score**: 9/10 | **Effort**: Medium (2-3 semaines) | **Impact**: Élevé

### Description
Système de gestion de contenu pour blog et portfolio, avec affichage des articles directement dans le monde 3D sous forme de documents/terminals interactifs.

### Fonctionnalités
- [ ] Prisma models: `Post`, `Project`, `Category`
- [ ] API routes CRUD (`/api/blog`, `/api/projects`)
- [ ] Admin UI protégé par NextAuth
- [ ] Blog posts comme "data-slates" dans Dev World
- [ ] Blog posts comme "neon displays" dans Art World
- [ ] Status: draft/published, scheduling

### Implémentation
```
src/
├── prisma/schema.ts (add Post, Project models)
├── app/
│   ├── api/blog/route.ts (index, create, update, delete)
│   ├── api/projects/route.ts
│   └── (admin)/blog/
│       ├── page.tsx (list)
│       └── [slug]/edit/page.tsx (editor)
├── core/3d/scenes/worlds/
│   ├── dev/BlogTerminals.tsx (blog displays)
│   └── art/NeonBlogDisplays.tsx
└── components/
    ├── admin/BlogEditor.tsx
    └── admin/ProjectEditor.tsx
```

### Dépendances
- Prisma (déjà installé)
- Shadcn UI forms (déjà installé)
- NextAuth (déjà configuré)

---

## 🥈 #2: Navigation 3D vers Projets

**Score**: 8.5/10 | **Effort**: Low (1 semaine) | **Impact**: Élevé

### Description
Les projets du portfolio sont exposés dans le monde 3D sur des pedestals interactifs. En s'approchant, le character peut interagir (E) pour voir les détails.

### Fonctionnalités
- [ ] "Project pedestals" dans Dev World (style Warhammer)
- [ ] "Art displays" dans Art World (style galerie)
- [ ] Interaction avec `useInteractionsRegistry`
- [ ] Overlay panel avec détails projet
- [ ] Navigation vers pages projet classiques

### Implémentation
```
src/
├── core/3d/scenes/
│   ├── objects/ProjectPedestal.tsx (Dev)
│   ├── objects/ArtDisplay.tsx (Art)
│   └── interactions/projectInteractions.ts
├── components/
│   └── 3d/ProjectOverlay.tsx (details panel)
└── store/
    └── project-store.ts (project data)
```

### Données Projects
```typescript
interface Project {
  id: string
  title: string
  slug: string
  description: string
  techStack: string[]
  thumbnail: string
  githubUrl?: string
  liveUrl?: string
  worldPosition: { x: number; z: number; world: 'dev' | 'art' }
}
```

---

## 🥉 #3: Guide IA Conversant

**Score**: 8/10 | **Effort**: Medium (2 semaines) | **Impact**: Très élevé

### Description
Un NPC dans chaque monde qui guide les visiteurs, répond aux questions sur les projets, et se souvient des visiteurs récurrents.

### Fonctionnalités
- [ ] NPC "Tech-Priest" dans Dev World
- [ ] NPC "Art Curator" dans Art World
- [ ] Chat via text + voice (Web Speech API)
- [ ] Vercel AI SDK pour réponses
- [ ] Mémoire des visiteurs (PostgreSQL)
- [ ] Animations idle et dialogue

### Implémentation
```
src/
├── core/3d/npc/
│   ├── AIGuide.tsx (base NPC)
│   ├── TechPriestGuide.tsx
│   ├── ArtGuide.tsx
│   └── useAIChat.ts (Vercel AI SDK)
├── app/
│   └── api/chat/route.ts (AI endpoint)
├── prisma/schema.ts (add VisitorMemory)
└── hooks/
    └── useWebSpeech.ts (voice input/output)
```

### Dépendances
- `ai` (Vercel AI SDK)
- `@ai-sdk/openai` ou autre provider

---

## 4️⃣ #4: Admin Dashboard avec Preview 3D

**Score**: 7.5/10 | **Effort**: Medium (1-2 semaines) | **Impact**: Moyen

### Description
Interface admin unique avec preview 3D live du contenu pendant l'édition.

### Fonctionnalités
- [ ] Dashboard principal avec stats
- [ ] Blog CRUD avec preview 3D
- [ ] Projects CRUD avec preview 3D
- [ ] Analytics (visites, interactions 3D)
- [ ] Mode preview interactif

### Implémentation
```
src/
├── app/(admin)/
│   ├── layout.tsx (protected)
│   ├── page.tsx (dashboard)
│   ├── blog/
│   │   ├── page.tsx (list)
│   │   └── [slug]/edit/page.tsx (editor + preview)
│   └── projects/
│       ├── page.tsx
│       └── [id]/edit/page.tsx
└── components/admin/
    ├── Preview3D.tsx (embedded canvas)
    ├── StatsCard.tsx
    └── EditForm.tsx
```

---

## 5️⃣ #5: URLs Partageables

**Score**: 7/10 | **Effort**: Low (2-3 jours) | **Impact**: Moyen

### Description
Permet de partager des états spécifiques du monde 3D via URL parameters.

### Fonctionnalités
- [ ] Encode world + position + interaction dans URL
- [ ] Hook `useWorldStateSync()` pour sync
- [ ] Format: `?world=art&x=10&z=-5&showProject=abc123`
- [ ] Bouton "Share this view"
- [ ] Génération de preview card (optionnel)

### Implémentation
```
src/
├── hooks/
│   └── useWorldStateSync.ts
├── core/3d/scenes/
│   └── TopDownScene.tsx (add URL sync)
└── components/
    └── ShareButton.tsx
```

### Format URL
```typescript
interface WorldStateURL {
  world: 'dev' | 'art'
  camX?: number
  camZ?: number
  showProject?: string
  showBlog?: string
}

// encode: btoa(JSON.stringify(state))
// ?s=eyJ3b3JsZCI6ImFydCIsImNhbVgiOjEwfQ==
```

---

## 📋 Progression

| Feature | Status | Progress |
|---------|--------|----------|
| URLs Partageables | ✅ Terminé | 100% |
| Navigation 3D Projets | ✅ Terminé | 80% |
| Headless CMS | ⚪ À faire | 0% |
| Admin Dashboard | ⚪ À faire | 0% |
| Guide IA | ⚪ À faire | 0% |

---

## 🔗 Dépendances entre features

```
Headless CMS ──┬──> Blog In-World
               └──> Admin Dashboard

Navigation 3D ──┬──> Utilise Project data (CMS)
               └──> URLs Partageables

Guide IA ──────> Utilise Project data (CMS)
```

**Ordre recommandé**:
1. URLs Partageables (quick win, indépendant)
2. Headless CMS (fondation)
3. Navigation 3D Projets (utilise CMS)
4. Admin Dashboard (utilise CMS)
5. Guide IA (utilise CMS)
