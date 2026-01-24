# Brainstorm Session Summary - Oalacea Design

## Topic
**Esthétique et Design du Portfolio Oalacea** - Réflexion stratégique sur l'identité visuelle, les améliorations UX et les tendances 2025-2026

---

## Session Info

| Metric | Value |
|--------|-------|
| Duration | ~45 minutes |
| Ideas Generated | 40 |
| Top Solutions | 7 |
| Participants | 4 agents (Créatif, UX, Tech, Brand) |

---

# 🎯 DESIGN DIRECTION RECOMMANDÉE

## "Digital Ethereal Professional"

Une esthétique qui fusionne:
- **Pragmatisme UX** - Accessibilité et performance
- **Motion subtil** - Animations fluides engageantes
- **Storytelling** - Narration visuelle du parcours
- **Premium feel** - Attention aux détails

---

## 🎨 PALETTE RECOMMANDÉE

### Light Mode
```css
--background: oklch(0.98 0.01 280);   /* Presque blanc, tiède */
--foreground: oklch(0.15 0.01 280);   /* Presque noir */
--primary: oklch(0.45 0.18 250);      /* Bleu vibrant */
--accent: oklch(0.60 0.20 320);       /* Violet électrique */
--muted: oklch(0.90 0.01 280);        /* Gris clair */
```

### Dark Mode
```css
--background: oklch(0.12 0.01 280);   /* Noir profond */
--foreground: oklch(0.95 0.01 280);   /* Blanc cassé */
--primary: oklch(0.65 0.20 250);      /* Bleu lumineux */
--accent: oklch(0.70 0.22 320);       /* Violet néon */
--muted: oklch(0.25 0.01 280);        /* Gris sombre */
```

### Mesh Gradient Colors (Background)
- `oklch(0.55 0.18 250)` - Bleu
- `oklch(0.65 0.15 320)` - Violet
- `oklch(0.60 0.12 180)` - Teal
- Animation: 60s cycle, gaussian blur 100px

---

## ✍️ TYPOGRAPHIE

### Font Stack
```css
--font-heading: 'Space Grotesk', sans-serif;  /* Titres distinctifs */
--font-body: 'Inter', sans-serif;             /* Lisibilité maximale */
--font-mono: 'Geist Mono', monospace;          /* Code */
```

### Scale (Fluid with clamp)
```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
--text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
--text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
--text-5xl: clamp(3rem, 2rem + 5vw, 5rem);     /* Hero oversized */
```

---

## 🚀 TOP FEATURES À IMPLÉMENTER

### Phase 1: Foundation (Week 1)

#### 1. Dark Mode + Time-Based Hero
```tsx
// src/components/time-hero.tsx
const getTimeTheme = () => {
  const hour = new Date().getHours();
  const themes = {
    morning: { bg: 'blue-50', message: 'Starting fresh with clean code' },
    afternoon: { bg: 'orange-50', message: 'Building at full speed' },
    evening: { bg: 'violet-950', message: 'Refining the details' },
    night: { bg: 'slate-950', message: 'The best ideas bloom in darkness' }
  };
  return hour < 12 ? themes.morning : hour < 18 ? themes.afternoon
       : hour < 23 ? themes.evening : themes.night;
};
```

#### 2. Focus Indicators + Skip Links
```css
/* globals.css */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
         focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white
         focus:rounded-md focus:transition-focus;
}

*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}
```

#### 3. Project Stories Format
```tsx
// src/components/project-story.tsx
interface ProjectStory {
  hook: string;        // "Le client a dit..."
  challenge: string;   // Le problème
  solution: string;    // Ce qu'on a construit
  behind: {            // Les coulisses
    stack: string[];
    decisions: string[];
  };
  spoil?: string;      // Ce qu'on referait différemment
}
```

---

### Phase 2: Motion (Week 2)

#### 4. Smooth Scroll (Lenis)
```bash
pnpm add @studio-freight/lenis
```
```tsx
// src/components/smooth-scroll.tsx
import Lenis from '@studio-freight/lenis';

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);
  return null;
}
```

#### 5. Scroll Reveal Animations
```tsx
// src/components/scroll-reveal.tsx
import { motion, useInView } from 'framer-motion';

export function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

#### 6. Magnetic Buttons
```tsx
// src/components/ui/magnetic-button.tsx
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticButton({ children, ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

---

### Phase 3: Polish (Week 3)

#### 7. Mesh Gradient Background
```css
/* globals.css */
.mesh-gradient {
  background:
    radial-gradient(at 20% 30%, oklch(0.55 0.18 250) 0px, transparent 50%),
    radial-gradient(at 80% 20%, oklch(0.65 0.15 320) 0px, transparent 50%),
    radial-gradient(at 40% 80%, oklch(0.60 0.12 180) 0px, transparent 50%);
  filter: blur(100px);
  animation: mesh-move 60s ease-in-out infinite alternate;
}

@keyframes mesh-move {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-5%, 5%); }
}
```

#### 8. About en Chapitres
```tsx
// Content structure
const chapters = [
  {
    title: "Chapter I: The First Hello World",
    subtitle: "L'été où j'ai découvert la création",
    year: "2018",
    content: "..."
  },
  {
    title: "Chapter II: The Framework Awakening",
    subtitle: "Quand les patterns sont devenus clairs",
    year: "2020",
    content: "..."
  },
  // ...
];
```

---

## 📦 PACKAGES NÉCESSAIRES

```json
{
  "dependencies": {
    "@studio-freight/lenis": "^1.0.42",
    "framer-motion": "^11.11.17",
    "space-grotesk": "^3.0.0"
  }
}
```

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1: Foundation
- [ ] Installer fonts (Space Grotesk)
- [ ] Implémenter dark mode avec toggle
- [ ] Créer time-based hero
- [ ] Ajouter skip links + focus indicators
- [ ] Structurer format "project stories"

### Week 2: Motion
- [ ] Installer et configurer Lenis
- [ ] Créer composant ScrollReveal
- [ ] Créer composant MagneticButton
- [ ] Ajouter scroll progress indicator
- [ ] Optimiser reduced motion

### Week 3: Polish
- [ ] Implémenter mesh gradient background
- [ ] Créer page "About" en chapitres
- [ ] Ajouter micro-interactions
- [ ] Test accessibilité complète
- [ ] Performance audit (Lighthouse)

---

## 🎯 SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | 95+ | ? |
| Lighthouse Accessibility | 100 | ? |
| Lighthouse Best Practices | 95+ | ? |
| First Contentful Paint | <1s | ? |
| Cumulative Layout Shift | <0.1 | ? |

---

## 📚 INSPIRATIONS

### Design References
- **Vercel** - Clean, dark mode, subtle gradients
- **Linear** - Smooth motion, micro-interactions
- **Bruno Simon** - Interactive 3D (aspiration)
- **Gatsby** - Bold typography, dark aesthetic

### Color Inspiration
- **Dracula Theme** - Purple base
- **Nord Theme** - Cool, muted tones
- **Catppuccin** - Modern pastel latte

---

## 🚀 NEXT STEPS

1. **Valider la direction** - Approbation du design system
2. **Créer design tokens** - Variables CSS complètes
3. **Implémenter Phase 1** - Foundation features
4. **Tester et itérer** - Feedback utilisateur
5. **Documenter** - Guidelines pour l'équipe

---

**Session Status**: ✅ COMPLETE

**Recommendation**: Procéder avec l'implémentation Phase 1 immédiatement

---

## 📁 ARTIFACTS

- Analysis: `.claude/.smite/.predator/brainstorm/runs/20250124_000000/01_ANALYZE.md`
- Plan: `.claude/.smite/.predator/brainstorm/runs/20250124_000000/02_PLAN.md`
- Execution: `.claude/.smite/.predator/brainstorm/runs/20250124_000000/03_EXECUTE.md`
- Validation: `.claude/.smite/.predator/brainstorm/runs/20250124_000000/04_VALIDATE.md`
- Summary: `.claude/.smite/.predator/brainstorm/runs/20250124_000000/SUMMARY.md`
