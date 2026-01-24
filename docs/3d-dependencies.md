# Oalacea 3D - Dependencies Guide

> Liste complète des dépendances à installer pour le portfolio 3D

**Version:** 1.0.0
**Last Updated:** 2026-01-24

---

## Installation

### Commande Complete

```bash
# Core 3D
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing three three-stdlib

# Physics
pnpm add @react-three/rapier

# Character Controller
pnpm add ecctrl

# GLTF Loading
pnpm add @react-three/gltfjsx

# Transitions & Animation
pnpm add @theatre/core @theatre/r3f framer-motion

# Development
pnpm add -D gltfjsx @types/three
```

### Installation Graduelle (par Phase)

#### Phase 1: Foundation
```bash
pnpm add @react-three/fiber @react-three/drei three
pnpm add -D @types/three
```

#### Phase 2: Character
```bash
pnpm add @react-three/rapier ecctrl @react-three/gltfjsx
pnpm add -D gltfjsx
```

#### Phase 3: Worlds & Effects
```bash
pnpm add @react-three/postprocessing @theatre/core @theatre/r3f
```

#### Phase 4: UI
```bash
pnpm add framer-motion
```

---

## Versions Recommandées

| Package | Version | Notes |
|---------|---------|-------|
| @react-three/fiber | ^8.17.0 | Core renderer |
| @react-three/drei | ^9.114.0 | Helpers & abstractions |
| @react-three/postprocessing | ^2.16.0 | Effects & post-processing |
| @react-three/rapier | ^1.5.0 | Physics engine |
| three | ^0.169.0 | 3D library |
| three-stdlib | ^2.32.0 | Standard utilities |
| ecctrl | ^1.2.0 | Character controller |
| @theatre/core | ^0.7.0 | Animation tool |
| @theatre/r3f | ^0.7.0 | Theatre + R3F integration |
| framer-motion | ^11.11.0 | UI animations |

---

## Package.json Complet

Ajoutez ces dépendances à votre `package.json` existant :

```json
{
  "dependencies": {
    "...": "vos dépendances existantes...",

    // === 3D CORE ===
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.114.0",
    "@react-three/postprocessing": "^2.16.0",
    "three": "^0.169.0",
    "three-stdlib": "^2.32.0",

    // === PHYSICS ===
    "@react-three/rapier": "^1.5.0",
    "rapier3d-compat": "^0.14.0",

    // === CHARACTER ===
    "ecctrl": "^1.2.0",

    // === LOADING ===
    "@react-three/gltfjsx": "^6.6.0",

    // === TRANSITIONS ===
    "@theatre/core": "^0.7.0",
    "@theatre/r3f": "^0.7.0",

    // === UI ANIMATIONS ===
    "framer-motion": "^11.11.0"
  },
  "devDependencies": {
    "...": "vos devDependencies existantes...",

    "gltfjsx": "^6.6.0",
    "@types/three": "^0.169.0"
  }
}
```

---

## Notes de Compatibilité

### React Three Fiber + Next.js 16

R3F est compatible avec Next.js 16 et React 19, mais avec quelques considerations :

1. **Client Components Only** - Tous les composants 3D doivent être `'use client'`

2. **No SSR** - Le Canvas 3D ne doit pas être rendu cote serveur

```typescript
// src/app/layout.tsx
import dynamic from 'next/dynamic';

// Dynamic import pour éviter SSR
const SceneContainer = dynamic(
  () => import('@/core/3d/scenes/SceneContainer'),
  { ssr: false }
);
```

3. **Window Object** - Certains helpers Three.js nécessitent `window`

```typescript
// Utilisez useEffect pour le code qui nécessite window
useEffect(() => {
  // Code utilisant window, document, etc.
}, []);
```

---

## Dépannage

### Erreur: "three is not peer dependency"

Si vous rencontrez des erreurs de peer dependency :

```bash
# Force l'installation des peer dependencies
pnpm install --strict-peer-dependencies=false

# Ou utilisez
pnpm install --shamefully-hoist
```

### Erreur: "Cannot find module '@react-three/fiber'"

Assurez-vous que node_modules est propre :

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Performance: Dev mode lent

Le dev mode peut être lent avec Three.js. Consider :

1. Utiliser `pnpm build && pnpm start` pour tester la performance réelle
2. Reduire la taille des textures pendant le développement
3. Utiliser des modèles low-poly placeholder pendant le dev

---

## Prochaine Étape

Après installation, suivez la roadmap dans `3d-architecture.md` :

1. Phase 1: Fondation Technique
2. Phase 2: Personnage + Contrôle
3. Phase 3: Les Deux Mondes
4. Phase 4: Interactions + Navigation
5. Phase 5: Content + Polish
