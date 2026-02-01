# Implementation Plan

## Task
Créer un route group "(mie)" avec deux routes publiques : /blogs et /projets avec leurs pages de détail.

## Files to Create

### 1. Route Group Layout
- `src/app/(mie)/layout.tsx`
  - Purpose: Layout simple pour les pages publiques (Header + main + Footer)
  - Dependencies: Header, Footer from `@/components/layout`
  - Size: small (~15 lines)
  - Pattern: Copy from `(marketing)/layout.tsx`

### 2. Blog Listing Page
- `src/app/(mie)/blogs/page.tsx`
  - Purpose: Page publique listant tous les articles de blog publiés
  - Dependencies: getPosts from `@/actions/blog`, BlogGrid from `@/features/blog/components`
  - Size: small (~30 lines)
  - Server Component avec data fetching

### 3. Blog Detail Page
- `src/app/(mie)/blogs/[slug]/page.tsx`
  - Purpose: Page individuelle d'un article de blog
  - Dependencies: getPostBySlug from `@/actions/blog`, Comments from `@/features/blog/components`
  - Size: medium (~50 lines)
  - Server Component + Client Component pour les commentaires

### 4. Projects Listing Page
- `src/app/(mie)/projets/page.tsx`
  - Purpose: Page publique listant tous les projets
  - Dependencies: getProjects from `@/actions/projects`, ProjectGrid from `@/features/portfolio/components`
  - Size: small (~30 lines)
  - Server Component avec data fetching

### 5. Project Detail Page
- `src/app/(mie)/projets/[slug]/page.tsx`
  - Purpose: Page individuelle d'un projet
  - Dependencies: getProjectBySlug from `@/actions/projects`
  - Size: medium (~60 lines)
  - Server Component avec liens externes (GitHub, Live URL)

## Files to Modify

None - all new files.

## Acceptance Criteria

### Functional Requirements
- [ ] Route group `(mie)` créé avec layout Header/Footer
- [ ] Route `/blogs` accessible publiquement avec liste des articles publiés
- [ ] Route `/blogs/[slug]` accessible avec détail de l'article
- [ ] Route `/projets` accessible publiquement avec liste des projets
- [ ] Route `/projets/[slug]` accessible avec détail du projet
- [ ] Pages utilisent les server actions existantes
- [ ] Pages utilisent les composants existants (BlogGrid, ProjectGrid, etc.)
- [ ] Layout simple inspiré du groupe `(marketing)`

### Non-Functional Requirements
- [ ] Code passe le linting
- [ ] Code passe le typecheck
- [ ] Build réussit
- [ ] Pas de console.log

### Quality Standards
- [ ] Suit les patterns existants du codebase
- [ ] Utilise le système de thème existant (useWorldTheme)
- [ ] Gestion des erreurs (404 pour slug invalide)
- [ ] Noms de variables clairs

## Implementation Steps

### Phase 1: Route Group Setup
- [ ] Create `src/app/(mie)/layout.tsx`

### Phase 2: Blog Routes
- [ ] Create `src/app/(mie)/blogs/page.tsx`
- [ ] Create `src/app/(mie)/blogs/[slug]/page.tsx`

### Phase 3: Project Routes
- [ ] Create `src/app/(mie)/projets/page.tsx`
- [ ] Create `src/app/(mie)/projets/[slug]/page.tsx`

### Phase 4: Testing
- [ ] Vérifier les routes dans le navigateur
- [ ] Tester les liens depuis la navigation
- [ ] Vérifier les pages 404

## Risk Assessment

### Low Risk Items
- Création de nouvelles routes (pas de modifications de code existant)
- Utilisation de server actions et composants déjà testés

### Medium Risk Items
- Gestion des 404 pour les slugs invalides (utiliser notFound())

### Mitigation
- Utiliser `notFound()` de Next.js pour les slugs non trouvés
- Suivre exactement le pattern du layout `(marketing)`
