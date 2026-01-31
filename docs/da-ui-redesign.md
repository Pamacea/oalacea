# DA - Refonte UI/UX Oalacea

**Version**: 1.0
**Date**: 31 janvier 2026
**Auteur**: Design System Team
**Statut**: Draft

---

## 1. Introduction

### 1.1 Vision

Oalacea aspire a devenir une plateforme immersive, mystErieuse et brutale, s'inspirant de l'esthEtique Warhammer 40K Imperium et du gaming brutalist. L'expErience utilisateur doit transporter les visiteurs dans un univers sombre, Epique et technologiquement avancE.

### 1.2 Objectifs

- **CrEer une identitE visuelle unique** qui se diffErencie des plateformes classiques
- **Immersion totale** via des animations glitch, overdrive et distortion
- **CohErence design system** pour une scalabilitE maximale
- **AccessibilitE** malgrE l'esthEtique brutale
- **Performance** des animations et interactions

### 1.3 Principes directeurs

1. **Dark First** : Le mode sombre est l'expErience par dEfaut, pas de light mode
2. **Brutalisme ContrOlE** : Formes carrEes, sans arrondis, mais avec soin
3. **Accent Colors** : Utilisation stratEgique du Crimson et Gold pour guider l'attention
4. **Animation with Purpose** : Chaque animation a une fonction (feedback, guidage, ambiance)
5. **Semantic Variables** : CSS variables nommEes sEmantiquement pour la maintenance

---

## 2. Principes de Design

### 2.1 IdentitE Visuelle

```
MystErieux + Immersif + Brutaliste
       _________________
      |                 |
      |   Warhammer 40K | + Gaming Brutalist
      |   Imperium      |
      |_________________|
```

### 2.2 Philosophie de Forme

- **Border Radius**: `rounded-none` - ZEro courbure, brutalisme pur
- **Borders**: Accent colorEs pour dElimiter les zones
- **Shadows**: RemplacEes par des effets glitch et borders
- **Contraste**: ElevE pour accessibilitE (WCAG AA minimum)

### 2.3 Approche Animation

```css
/* Spectre d'animation */
[TrEs lent/lourd] ---------- [Vif/assassin]
   Overdrive                  Glitch
   Chrono                     Distortion
```

---

## 3. Palette de Couleurs

### 3.1 Warhammer 40K Imperium Theme

```css
/* === PRIMARY ACCENTS === */

/* Crimson Red - Primary Action */
--imperium-crimson: #dc143c;
--imperium-crimson-dim: #a01030;
--imperium-crimson-glow: #ff1a4d;

/* Gold - Secondary Accent */
--imperium-gold: #ffd700;
--imperium-gold-dim: #ccad00;
--imperium-glow-gold: #ffe033;

/* === BASE COLORS === */

/* Black - Background */
--imperium-black: #0a0a0a;
--imperium-black-raise: #141414;
--imperium-black-elevate: #1e1e1e;

/* Ivory/Cream - Text Primary */
--imperium-ivory: #fffff0;
--imperium-ivory-dim: #e8e8d8;
--imperium-ivory-muted: #a0a090;

/* === METALLIC & AGED === */

/* Iron - Borders/Metallic */
--imperium-iron: #4a4a4a;
--imperium-iron-dark: #3a3a3a;
--imperium-iron-light: #6a6a6a;

/* Dark Maroon - Depth */
--imperium-maroon: #66023c;
--imperium-maroon-deep: #440128;

/* Rust - Aged Effects */
--imperium-rust: #8b4513;
--imperium-rust-dark: #6b350e;
```

### 3.2 Semantic Mapping (pour Tailwind/CSS)

```css
:root {
  /* === Semantic Variables === */

  /* Background */
  --background: var(--imperium-black);
  --background-raise: var(--imperium-black-raise);
  --background-elevate: var(--imperium-black-elevate);

  /* Foreground/Text */
  --foreground: var(--imperium-ivory);
  --foreground-dim: var(--imperium-ivory-dim);
  --foreground-muted: var(--imperium-ivory-muted);

  /* Primary Action */
  --primary: var(--imperium-crimson);
  --primary-hover: var(--imperium-crimson-glow);
  --primary-active: var(--imperium-crimson-dim);

  /* Secondary Action */
  --secondary: var(--imperium-gold);
  --secondary-hover: var(--imperium-glow-gold);
  --secondary-active: var(--imperium-gold-dim);

  /* Borders */
  --border: var(--imperium-iron);
  --border-dim: var(--imperium-iron-dark);
  --border-accent: var(--imperium-crimson);

  /* Destructive */
  --destructive: var(--imperium-maroon);
  --destructive-hover: var(--imperium-crimson);

  /* Muted */
  --muted: var(--imperium-black-elevate);
  --muted-foreground: var(--imperium-ivory-muted);

  /* Accent */
  --accent: var(--imperium-maroon);
  --accent-hover: var(--imperium-crimson);
  --accent-foreground: var(--imperium-ivory);

  /* Card */
  --card: var(--imperium-black-raise);
  --card-foreground: var(--imperium-ivory);

  /* Input */
  --input: var(--imperium-black-elevate);
  --input-border: var(--imperium-iron);

  /* Ring (Focus) */
  --ring: var(--imperium-crimson);
  --ring-glow: var(--imperium-crimson-glow);
}
```

### 3.3 Tailwind Configuration

```javascript
// tailwind.config.js (CSS v4 syntax)
@theme {
  /* Imperium Colors */
  --color-imperium-crimson: #dc143c;
  --color-imperium-crimson-dim: #a01030;
  --color-imperium-crimson-glow: #ff1a4d;

  --color-imperium-gold: #ffd700;
  --color-imperium-gold-dim: #ccad00;
  --color-imperium-glow-gold: #ffe033;

  --color-imperium-black: #0a0a0a;
  --color-imperium-black-raise: #141414;
  --color-imperium-black-elevate: #1e1e1e;

  --color-imperium-ivory: #fffff0;
  --color-imperium-ivory-dim: #e8e8d8;
  --color-imperium-ivory-muted: #a0a090;

  --color-imperium-iron: #4a4a4a;
  --color-imperium-iron-dark: #3a3a3a;
  --color-imperium-iron-light: #6a6a6a;

  --color-imperium-maroon: #66023c;
  --color-imperium-rust: #8b4513;
}
```

### 3.4 Usage Guidelines

| Scenario | Couleur | Rationale |
|----------|---------|-----------|
| CTA Primary | `imperium-crimson` | Action forte, urgence |
| CTA Secondary | `imperium-gold` | Premium, distinction |
| Background principal | `imperium-black` | Profondeur, immersion |
| Cards | `imperium-black-raise` | HiErarchie subtile |
| Texte principal | `imperium-ivory` | LisibilitE maximale |
| Texte secondaire | `imperium-ivory-dim` | HiErarchie visuelle |
| Borders | `imperium-iron` | Structure sans distraction |
| Error/Destructive | `imperium-maroon` | Danger, imperium warning |

---

## 4. Typographie

### 4.1 Font Families

```css
:root {
  --font-sans: 'Geist Sans', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;
  --font-display: 'Geist Sans', system-ui, sans-serif;
}
```

### 4.2 Type Scale

| Taille | Classe | Usage | Line-height |
|--------|--------|-------|-------------|
| 48px | `text-4xl` | H1 Hero | `leading-tight` (1.25) |
| 36px | `text-3xl` | H2 Section | `leading-tight` (1.25) |
| 24px | `text-2xl` | H3 Subsection | `leading-tight` (1.25) |
| 20px | `text-xl` | H4 Component | `leading-snug` (1.375) |
| 16px | `text-base` | Body | `leading-normal` (1.5) |
| 14px | `text-sm` | Small body | `leading-normal` (1.5) |
| 12px | `text-xs` | Caption | `leading-relaxed` (1.625) |

### 4.3 Font Weights

```css
--font-light: 300;    /* Rare usage */
--font-normal: 400;   /* Body text */
--font-medium: 500;   /* UI elements */
--font-semibold: 600; /* Subheadings */
--font-bold: 700;     /* Headings */
--font-extrabold: 800; /* Display */
```

### 4.4 Typography Utilities

```css
/* Density classes */
.typography-dense {
  letter-spacing: -0.02em; /* tracking-tight */
  line-height: 1.25;       /* leading-tight */
}

.typography-normal {
  letter-spacing: 0;
  line-height: 1.5;
}

/* Display classes */
.text-display {
  @apply text-4xl font-extrabold tracking-tight leading-tight;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-heading {
  @apply text-2xl font-bold tracking-tight leading-tight;
}

.text-body {
  @apply text-base font-normal leading-relaxed;
}

.text-caption {
  @apply text-xs font-medium text-imperium-ivory-muted;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## 5. Espacement & Layout

### 5.1 Spacing Scale

Tailwind CSS scale par dEfaut (base 4px):

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | None |
| `px` | 1px | Hairline |
| `0.5` | 2px | Tight |
| `1` | 4px | Compact |
| `2` | 8px | Cozy |
| `3` | 12px | Comfortable |
| `4` | 16px | Spacious |
| `5` | 20px | Extra |
| `6` | 24px | Section spacing |
| `8` | 32px | Component gap |
| `10` | 40px | Large section |
| `12` | 48px | Hero spacing |
| `16` | 64px | Page margins |
| `20` | 80px | Container spacing |
| `24` | 96px | Hero spacing |

### 5.2 Container System

```css
/* Containers fluids, pas de max-w fixes */
.container-fluid {
  width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
}

/* Breakpoints widths */
@screen sm { max-width: 640px; }
@screen md { max-width: 768px; }
@screen lg { max-width: 1024px; }
@screen xl { max-width: 1280px; }
@screen 2xl { max-width: 1536px; }
```

### 5.3 Layout Patterns

```css
/* Grid standard */
.grid-imperium {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(12, 1fr);
}

/* Stack pattern */
.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stack-tight {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stack-loose {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

### 5.4 Padding Strategy

**Approche**: Padding dominant, gaps pour espacer

```tsx
// Composant avec padding interne
<div className="p-6 gap-4">
  {/* contenu */}
</div>

// Section padding
<section className="py-12 px-6">
  {/* contenu */}
</section>
```

---

## 6. Composants

### 6.1 Button

#### Variantes

```tsx
// button.tsx - CVA configuration
const buttonVariants = cva(
  // Base: AUCUN border radius
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 outline-none",
  {
    variants: {
      variant: {
        // Primary - Crimson brutal
        primary: "bg-imperium-crimson text-imperium-ivory border-2 border-imperium-crimson hover:bg-imperium-crimson-glow hover:border-imperium-crimson-glow hover:shadow-[0_0_20px_rgba(220,20,60,0.5)] active:translate-y-px",

        // Secondary - Gold premium
        secondary: "bg-imperium-black text-imperium-gold border-2 border-imperium-gold hover:bg-imperium-gold hover:text-imperium-black active:translate-y-px",

        // Brutal - Glitch effect
        brutal: "bg-transparent text-imperium-crimson border-2 border-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-ivory glitch-hover",

        // Distordu - Overdrive effect
        distordu: "bg-imperium-maroon text-imperium-ivory border-2 border-imperium-maroon hover:distort-hover active:scale-95",

        // Glow - Neon style
        glow: "bg-transparent text-imperium-crimson border border-imperium-crimson shadow-[0_0_10px_rgba(220,20,60,0.5)] hover:shadow-[0_0_25px_rgba(220,20,60,0.8)] hover:bg-imperium-crimson/10",

        // Ghost
        ghost: "bg-transparent text-imperium-ivory border border-imperium-iron hover:bg-imperium-iron hover:border-imperium-ivory",

        // Outline
        outline: "bg-transparent text-imperium-ivory border-2 border-imperium-ivory hover:bg-imperium-ivory hover:text-imperium-black",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        xl: "h-16 px-10 text-xl",
        icon: "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)
```

#### Examples

```tsx
// Primary CTA
<Button variant="primary" size="lg">
  Join the Imperium
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Learn More
</Button>

// Glitch button
<Button variant="brutal">
  Initialize
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Menu />
</Button>
```

### 6.2 Card

#### Structure

```tsx
// card.tsx
const cardVariants = cva(
  "rounded-none border transition-all",
  {
    variants: {
      variant: {
        // Standard card avec accent border
        default: "bg-imperium-black-raise border-imperium-iron",

        // Crimson accent
        crimson: "bg-imperium-black-raise border-imperium-crimson border-l-4 border-l-imperium-crimson",

        // Gold accent
        gold: "bg-imperium-black-raise border-imperium-gold border-l-4 border-l-imperium-gold",

        // Brutal - Multiple borders
        brutal: "bg-imperium-black-elevate border-imperium-crimson border-2 shadow-[4px_4px_0_rgba(220,20,60,0.5)] hover:shadow-[8px_8px_0_rgba(220,20,60,0.5)] hover:-translate-x-1 hover:-translate-y-1",

        // Glitch card
        glitch: "bg-imperium-black-raise border-imperium-iron relative overflow-hidden group",

        // Glass morphism
        glass: "bg-imperium-black/80 backdrop-blur border-imperium-iron/50",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)
```

#### Glitch Card with Mineral Effect

```tsx
// Mineral card avec div absolute pour casser la forme
export function MineralCard({ children, className }: Props) {
  return (
    <div className={cn(
      "relative bg-imperium-black-raise border-2 border-imperium-crimson p-6",
      "overflow-hidden group",
      className
    )}>
      {/* Effet mineral - div qui depasse */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-imperium-crimson" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-imperium-gold" />

      {/* Glitch overlay */}
      <div className="absolute inset-0 bg-imperium-crimson/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
    </div>
  )
}
```

#### Examples

```tsx
// Standard card
<Card>
  <CardHeader>
    <CardTitle>Header</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Crimson accent
<Card variant="crimson">
  <CardHeader>
    <CardTitle>Alert</CardTitle>
  </CardHeader>
  <CardContent>Urgent content</CardContent>
</Card>

// Brutal card
<Card variant="brutal">
  <CardContent>Bold statement</CardContent>
</Card>

// Mineral card
<MineralCard>
  <CardTitle>Chapter Asset</CardTitle>
  <CardDescription>Imperium data</CardDescription>
</MineralCard>
```

### 6.3 Input

```tsx
// input.tsx
const inputVariants = cva(
  "flex w-full rounded-none border bg-imperium-black-elevate px-4 py-3 text-imperium-ivory placeholder:text-imperium-ivory-muted outline-none transition-all",
  {
    variants: {
      variant: {
        default: "border-imperium-iron focus:border-imperium-crimson focus:ring-1 focus:ring-imperium-crimson/50",
        crimson: "border-imperium-crimson focus:border-imperium-crimson-glow focus:ring-1 focus:ring-imperium-crimson/50",
        gold: "border-imperium-gold focus:border-imperium-glow-gold focus:ring-1 focus:ring-imperium-gold/50",
      },
      size: {
        sm: "h-10 px-3 text-sm",
        md: "h-12 px-4 text-base",
        lg: "h-14 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
```

### 6.4 Navigation

```tsx
// Floating vertical navigation - COTE DROIT
export function ImperiumNav() {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "w-14 h-14 flex items-center justify-center",
              "border-2 border-imperium-iron bg-imperium-black-raise",
              "text-imperium-ivory-muted hover:text-imperium-crimson",
              "hover:border-imperium-crimson hover:bg-imperium-crimson/10",
              "transition-all",
              "rounded-none"
            )}
          >
            <item.icon className="size-6" />
          </a>
        ))}
      </div>
    </nav>
  )
}
```

### 6.5 Badge

```tsx
// badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-imperium-iron bg-imperium-black-elevate text-imperium-ivory",
        crimson: "border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson",
        gold: "border-imperium-gold bg-imperium-gold/20 text-imperium-gold",
        outline: "border-imperium-ivory bg-transparent text-imperium-ivory",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### 6.6 Dialog/Modal

```tsx
// dialog.tsx - Imperium style
export function ImperiumDialog({ children, ...props }) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn(
        "border-2 border-imperium-crimson bg-imperium-black-raise",
        "rounded-none shadow-[0_0_50px_rgba(220,20,60,0.3)]",
        "max-w-[85%]"
      )}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

### 6.7 Table

```tsx
// table.tsx - Brutal data display
export function ImperiumTable({ children, className }) {
  return (
    <div className={cn("w-full overflow-auto border-2 border-imperium-iron", className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

export function ImperiumTableHeader({ className, ...props }) {
  return (
    <thead className={cn(
      "border-b-2 border-imperium-crimson bg-imperium-maroon/30",
      className
    )} {...props} />
  )
}

export function ImperiumTableRow({ className, ...props }) {
  return (
    <tr className={cn(
      "border-b border-imperium-iron hover:bg-imperium-crimson/10",
      "transition-colors",
      className
    )} {...props} />
  )
}
```

---

## 7. Animations & Interactions

### 7.1 Glitch Effect

```css
/* Glitch keyframes */
@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes glitch-skew {
  0% {
    transform: skew(0deg);
  }
  20% {
    transform: skew(-1deg);
  }
  40% {
    transform: skew(1deg);
  }
  60% {
    transform: skew(-0.5deg);
  }
  80% {
    transform: skew(0.5deg);
  }
  100% {
    transform: skew(0deg);
  }
}

@keyframes glitch-rgb {
  0% {
    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
  }
  25% {
    text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
  }
  50% {
    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
  }
  75% {
    text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
  }
  100% {
    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
  }
}

/* Glitch utility classes */
.glitch-hover:hover {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}

.glitch-text {
  animation: glitch-rgb 0.5s infinite;
}

.glitch-once {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 7.2 Overdrive Effect

```css
/* Overdrive - lent/lourd */
@keyframes overdrive-pulse {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: brightness(1.2) saturate(1.3);
  }
}

@keyframes overdrive-burn {
  0% {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(220, 20, 60, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
  }
}

.overdrive-pulse {
  animation: overdrive-pulse 2s ease-in-out infinite;
}

.overdrive-glow {
  animation: overdrive-burn 3s ease-in-out infinite;
}
```

### 7.3 Distortion Effect

```css
/* Distortion - vif/assassin */
@keyframes distort {
  0% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  25% {
    clip-path: polygon(5% 0%, 95% 5%, 100% 95%, 0% 100%);
  }
  50% {
    clip-path: polygon(0% 5%, 100% 0%, 95% 100%, 5% 95%);
  }
  75% {
    clip-path: polygon(5% 5%, 95% 0%, 100% 95%, 0% 95%);
  }
  100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

.distort-hover:hover {
  animation: distort 0.2s ease-out;
}

@keyframes distort-skew {
  0%, 100% {
    transform: skewX(0deg) scaleX(1);
  }
  25% {
    transform: skewX(-2deg) scaleX(0.98);
  }
  50% {
    transform: skewX(1deg) scaleX(1.02);
  }
  75% {
    transform: skewX(-1deg) scaleX(0.99);
  }
}

.distort-fast {
  animation: distort-skew 0.15s ease-out;
}
```

### 7.4 Chrono Effect

```css
/* Chrono - temporal feeling */
@keyframes chrono-scan {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 0% 100%;
  }
}

@keyframes chrono-flicker {
  0%, 100% { opacity: 1; }
  41% { opacity: 1; }
  42% { opacity: 0.8; }
  43% { opacity: 1; }
  45% { opacity: 0.3; }
  46% { opacity: 1; }
  90% { opacity: 1; }
  91% { opacity: 0.5; }
  92% { opacity: 1; }
}

.chrono-scanline {
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(220, 20, 60, 0.1) 50%
  );
  background-size: 100% 4px;
  animation: chrono-scan 0.5s linear infinite;
}

.chrono-flicker {
  animation: chrono-flicker 3s infinite;
}
```

### 7.5 Hover Effects

```css
/* Strong hover states */
.hover-strong {
  transition: all 0.2s ease;
}

.hover-strong:hover {
  background-color: rgba(220, 20, 60, 0.2);
  border-color: var(--imperium-crimson);
  transform: translateY(-2px);
}

/* Transition timing utilities */
.transition-slow {
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fast {
  transition-duration: 100ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.transition-assassin {
  transition-duration: 50ms;
  transition-timing-function: ease-out;
}
```

### 7.6 Animation Utilities

```tsx
// Framer Motion presets
export const imperiumPresets = {
  // Glitch preset
  glitch: {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.02, 0.98, 1.01, 1],
      x: [0, -2, 2, -1, 0],
      transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }
    }
  },

  // Overdrive preset
  overdrive: {
    initial: { opacity: 0.8 },
    animate: {
      opacity: [0.8, 1, 0.8],
      filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  // Distort preset
  distort: {
    initial: { scale: 1, skew: 0 },
    hover: {
      scale: 1.02,
      skew: 2,
      transition: { duration: 0.15, ease: 'easeOut' }
    }
  }
}
```

---

## 8. Implementation CSS/Tailwind

### 8.1 globals.css - Nouvelle Version

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ============================================
   OALACEA IMPERIUM THEME
   Dark First, Brutal, Immersive
   ============================================ */

@theme inline {
  /* Imperium Colors */
  --color-imperium-crimson: #dc143c;
  --color-imperium-crimson-dim: #a01030;
  --color-imperium-crimson-glow: #ff1a4d;

  --color-imperium-gold: #ffd700;
  --color-imperium-gold-dim: #ccad00;
  --color-imperium-glow-gold: #ffe033;

  --color-imperium-black: #0a0a0a;
  --color-imperium-black-raise: #141414;
  --color-imperium-black-elevate: #1e1e1e;

  --color-imperium-ivory: #fffff0;
  --color-imperium-ivory-dim: #e8e8d8;
  --color-imperium-ivory-muted: #a0a090;

  --color-imperium-iron: #4a4a4a;
  --color-imperium-iron-dark: #3a3a3a;
  --color-imperium-iron-light: #6a6a6a;

  --color-imperium-maroon: #66023c;
  --color-imperium-maroon-deep: #440128;
  --color-imperium-rust: #8b4513;

  /* Border Radius - NONE for brutalism */
  --radius-none: 0;
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;

  /* Fonts */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* ============================================
   CSS VARIABLES - Semantic Mapping
   ============================================ */

:root {
  /* Dark First - No light mode */
  --background: #0a0a0a;
  --foreground: #fffff0;

  /* Cards */
  --card: #141414;
  --card-foreground: #fffff0;

  /* Popover */
  --popover: #141414;
  --popover-foreground: #fffff0;

  /* Primary - Crimson */
  --primary: #dc143c;
  --primary-foreground: #fffff0;

  /* Secondary - Gold */
  --secondary: #ffd700;
  --secondary-foreground: #0a0a0a;

  /* Muted */
  --muted: #1e1e1e;
  --muted-foreground: #a0a090;

  /* Accent */
  --accent: #66023c;
  --accent-foreground: #fffff0;

  /* Destructive */
  --destructive: #66023c;
  --destructive-foreground: #fffff0;

  /* Borders */
  --border: #4a4a4a;
  --input: #4a4a4a;
  --ring: #dc143c;

  /* Chart colors */
  --chart-1: #dc143c;
  --chart-2: #ffd700;
  --chart-3: #66023c;
  --chart-4: #8b4513;
  --chart-5: #4a4a4a;
}

/* Dark class mirrors root (Dark First) */
.dark {
  --background: #0a0a0a;
  --foreground: #fffff0;
  --card: #141414;
  --card-foreground: #fffff0;
  --popover: #141414;
  --popover-foreground: #fffff0;
  --primary: #dc143c;
  --primary-foreground: #fffff0;
  --secondary: #ffd700;
  --secondary-foreground: #0a0a0a;
  --muted: #1e1e1e;
  --muted-foreground: #a0a090;
  --accent: #66023c;
  --accent-foreground: #fffff0;
  --destructive: #66023c;
  --destructive-foreground: #fffff0;
  --border: #4a4a4a;
  --input: #4a4a4a;
  --ring: #dc143c;
}

/* ============================================
   BASE LAYER
   ============================================ */

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-imperium-black text-imperium-ivory font-sans antialiased;
    font-feature-settings: "cv11", "ss01";
    font-variation-settings: "opsz" 32;
  }

  /* Typography base */
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
  }

  h1 {
    @apply text-4xl leading-tight;
  }

  h2 {
    @apply text-3xl leading-tight;
  }

  h3 {
    @apply text-2xl leading-tight;
  }

  h4 {
    @apply text-xl leading-snug;
  }

  /* Scrollbar hidden */
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  html, body {
    overflow-x: hidden;
    scrollbar-width: none;
  }

  /* Selection styling */
  ::selection {
    background-color: var(--imperium-crimson);
    color: var(--imperium-ivory);
  }
}

/* ============================================
   COMPONENTS LAYER
   ============================================ */

@layer components {
  /* Prose styles for editor content */
  .prose {
    @apply max-w-none text-imperium-ivory;
  }

  .prose h1 {
    @apply text-2xl font-bold text-imperium-ivory mt-6 mb-4 border-l-4 border-imperium-crimson pl-4;
  }

  .prose h2 {
    @apply text-xl font-bold text-imperium-ivory mt-5 mb-3 border-l-2 border-imperium-gold pl-3;
  }

  .prose h3 {
    @apply text-lg font-semibold text-imperium-ivory mt-4 mb-2;
  }

  .prose p {
    @apply my-3 leading-relaxed text-imperium-ivory-dim;
  }

  .prose a {
    @apply text-imperium-crimson underline hover:text-imperium-crimson-glow;
  }

  .prose strong {
    @apply font-bold text-imperium-ivory;
  }

  .prose code {
    @apply bg-imperium-black-elevate text-imperium-crimson px-1.5 py-0.5 text-sm font-mono border border-imperium-iron;
  }

  .prose pre {
    @apply bg-imperium-black-elevate border border-imperium-iron p-4 my-4 overflow-x-auto;
  }

  .prose blockquote {
    @apply border-l-4 border-imperium-maroon pl-4 italic text-imperium-ivory-muted my-4;
  }

  .prose ul {
    @apply list-disc list-inside my-3 space-y-1 text-imperium-ivory-dim;
  }

  .prose ol {
    @apply list-decimal list-inside my-3 space-y-1 text-imperium-ivory-dim;
  }

  /* Glitch container */
  .glitch-container {
    @apply relative overflow-hidden;
  }

  .glitch-container::before,
  .glitch-container::after {
    content: '';
    @apply absolute inset-0 pointer-events-none opacity-0;
    transition: opacity 0.3s;
  }

  .glitch-container:hover::before,
  .glitch-container:hover::after {
    @apply opacity-100;
  }

  /* Scanline overlay */
  .scanlines {
    @apply absolute inset-0 pointer-events-none;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0) 50%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.2)
    );
    background-size: 100% 4px;
  }
}

/* ============================================
   UTILITIES LAYER - Custom Effects
   ============================================ */

@layer utilities {
  /* Glitch animations */
  @keyframes glitch-shake {
    0%, 100% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
  }

  @keyframes glitch-rgb {
    0%, 100% {
      text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
    }
    25% {
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
    }
  }

  @keyframes distort-clip {
    0%, 100% {
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    }
    50% {
      clip-path: polygon(5% 5%, 95% 0%, 100% 95%, 0% 95%);
    }
  }

  @keyframes overdrive-pulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(220, 20, 60, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(220, 20, 60, 0.6);
    }
  }

  /* Utility classes */
  .animate-glitch {
    animation: glitch-shake 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .animate-glitch-rgb {
    animation: glitch-rgb 0.5s infinite;
  }

  .animate-distort {
    animation: distort-clip 0.2s ease-out;
  }

  .animate-overdrive {
    animation: overdrive-pulse 2s ease-in-out infinite;
  }

  .hover-glitch:hover {
    animation: glitch-shake 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .hover-distort:hover {
    animation: distort-clip 0.2s ease-out;
  }

  /* Glow effects */
  .glow-crimson {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.5);
  }

  .glow-gold {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .hover-glow-crimson:hover {
    box-shadow: 0 0 30px rgba(220, 20, 60, 0.8);
  }

  /* Border glow */
  .border-glow {
    box-shadow:
      inset 0 0 10px rgba(220, 20, 60, 0.3),
      0 0 10px rgba(220, 20, 60, 0.3);
  }

  /* Strong hover */
  .hover-strong {
    transition: all 0.2s ease;
  }

  .hover-strong:hover {
    background-color: rgba(220, 20, 60, 0.2);
    transform: translateY(-2px);
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### 8.2 Tailwind CSS v4 CSS-in-JS

```tsx
// Pour les composants qui ont besoin de styles dynamiques
const imperiumStyles = css`
  background-color: var(--imperium-black);
  border: 2px solid var(--imperium-crimson);

  &:hover {
    background-color: var(--imperium-crimson);
    color: var(--imperium-ivory);
  }

  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }

  &.glitch-active {
    animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
`
```

---

## 9. Migration Plan

### 9.1 Phases de Migration

#### Phase 1: Fondations (Semaine 1)

- [ ] Mettre a jour `globals.css` avec le nouveau theme Imperium
- [ ] Configurer les variables CSS dans le theme
- [ ] Mettre a jour les border radius a `0` partout
- [ ] Installer les dependances d'animation (framer-motion present)

#### Phase 2: Composants Core (Semaine 2)

- [ ] `Button` - Nouvelles variantes (primary, brutal, distordu, glow)
- [ ] `Card` - Mineral card, glitch effects
- [ ] `Input` - Nouveau styling
- [ ] `Badge` - Nouvelles variantes

#### Phase 3: Composants Complexes (Semaine 3)

- [ ] `Dialog` - Imperium styling
- [ ] `Table` - Brutal data display
- [ ] `Navigation` - Floating vertical nav
- [ ] `Toast/Sonner` - Crimson theme

#### Phase 4: Animations (Semaine 4)

- [ ] Implementer les keyframes glitch
- [ ] Implementer les keyframes overdrive
- [ ] Implementer les keyframes distortion
- [ ] Creer les presets Framer Motion

#### Phase 5: Pages Migration (Semaines 5-6)

- [ ] Homepage
- [ ] Dashboard
- [ ] Admin pages
- [ ] Blog/Content pages

#### Phase 6: Polish & Testing (Semaine 7)

- [ ] Verification accessibilite (WCAG AA)
- [ ] Performance des animations
- [ ] Cross-browser testing
- [ ] Mobile responsive

### 9.2 Checklist Composant par Composant

| Composant | Statut | Notes |
|-----------|--------|-------|
| Button | Todo | CVA variants a mettre a jour |
| Card | Todo | Mineral effect a implementer |
| Input | Todo | Border radius a 0 |
| Select | Todo | Custom dropdown |
| Checkbox | Todo | Square style |
| Radio | Todo | Square style |
| Switch | Todo | Brutal toggle |
| Dialog | Todo | Crimson border |
| Sheet | Todo | Full overlay |
| Table | Todo | Data display brutal |
| Badge | Todo | Uppercase tracking |
| Avatar | Todo | Square |
| Navigation | Todo | Floating vertical right |
| Toast | Todo | Sonner customization |
| Tooltip | Todo | Dark theme |
| Progress | Todo | Crimson bar |

### 9.3 Breaking Changes

```typescript
// BREAKING: Tous les rounded-* deviennent rounded-none
// Avant:
<Button className="rounded-md" />
// Apres:
<Button className="rounded-none" /> // ou juste sans la classe

// BREAKING: Nouvelle palette de couleurs
// Avant:
<div className="bg-primary text-primary-foreground" />
// Apres:
<div className="bg-imperium-crimson text-imperium-ivory" />

// BREAKING: Nouvelles variantes de composants
// Avant:
<Button variant="default" />
// Apres:
<Button variant="primary" /> // = crimson
<Button variant="secondary" /> // = gold
<Button variant="brutal" /> // = glitch effect
```

### 9.4 Rollback Strategy

- Git branch `feature/imperium-theme`
- Feature flag pour activer/desactiver le theme
- CSS variables dans un fichier separE pour revert facile
- Tests visuels avec Chromatic ou Percy

---

## 10. Annexes

### 10.1 Glossaire

| Terme | Definition |
|-------|------------|
| **Brutalisme** | Style design brutal, sans arrondis, contrastE |
| **Glitch** | Effet de distorsion numErique type "bug" |
| **Overdrive** | Animation lente/lourde, type saturation |
| **Distortion** | Animation rapide/vive, type cassure |
| **Chrono** | Effet temporel, type time travel |
| **Imperium** | REfrence Warhammer 40K, style officiel |
| **Mineral** | Effet visuel type "ressource de jeu vidEo" |

### 10.2 Resources

- **Warhammer 40K Visual Reference**: https://www.games-workshop.com
- **Brutal Web Design**: https://brutal-web.design
- **Glitch Effects**: https://css-tricks.com/glitch-effect-text-images-bbc/
- **Dark Mode Patterns**: https://darkmodepatterns.com

### 10.3 Accessibility Checklist

- [ ] Contrast ratio 4.5:1 minimum pour le texte normal
- [ ] Contrast ratio 3:1 minimum pour le texte large
- [ ] Focus visible sur tous les elements interactifs
- [ ] Reduced motion support (prefers-reduced-motion)
- [ ] Screen reader testing
- [ ] Keyboard navigation testing

### 10.4 Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | <1s | 1.5s |
| Largest Contentful Paint | <2s | 2.5s |
| Cumulative Layout Shift | <0.1 | 0.25 |
| Time to Interactive | <3s | 4s |
| Animation Frame Rate | 60fps | 30fps min |

---

## 11. Revision History

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | 2026-01-31 | Design Team | Creation initiale du document DA |

---

*End of Document*
