# DA - OALACEA BRUTALIST UI REDESIGN
**Version**: 2.0 - TRUE GRIMDARK
**Date**: 31 janvier 2026
**Inspiration**: Warhammer 40K + Neo-Brutalism + Glitch Art

---

## 1. PHILOSOPHIE: LE BEAU QUI COTOIE LE BIZARRE

> "Pour le beau qui côtoie le bizarre, on va arrêter de faire du clean. On veut du DÉGUEU, du RISQUE, du QUI DÉCHIRE."

**Principes**:
1. **Pas de safe design** - Casser les règles, surprendre
2. **Glitch permanent** - L'UI est vivante, elle bug, elle tremble
3. **Layout cassé** - Rien n'est aligné, tout est déconstruit
4. **Textures industrielles** - Rouille, poussière, usure
5. **High contrast violent** - Noir absolu vs Rouge criant

---

## 2. PALETTE WARHAMMER 40K (VRAIES COULEURS)

```css
/* === CITADEL PALETTE === */

/* Abaddon Black - Le noir profond */
--imperium-black: #1c1c1c;       /* Abaddon Black */
--imperium-black-deep: #0d0d0d;  /* Nuit noire */
--imperium-charcoal: #2a2a2a;    /* Charbon */

/* Mephiston Red - Le sang impérial */
--imperium-crimson: #9a1115;     /* Mephiston Red */
--imperium-crimson-bright: #c21a30; /* Wild Rider Red */
--imperium-crimson-dark: #6b0a12;    /* Evil Sunz Scarlet (dark) */

/* Retributor Gold - L'or impérial */
--imperium-gold: #b8a646;        /* Retributor Armor */
--imperium-gold-bright: #d4af37;    /* Auric Armor Gold */
--imperium-gold-dark: #8b7355;     /* Balthasar Gold */

/* Leadbelcher - Le métal usé */
--imperium-metal: #7b7b7b;       /* Leadbelcher */
--imperium-metal-dark: #4a4a4a;   /* Gunmetal */
--imperium-metal-light: #9e9e9e;  /* Ironbreaker */

/* Runelord Brass - Le bronze oxydé */
--imperium-brass: #7a6342;        /* Runelord Brass */
--imperium-copper: #8b5a2b;       /* Hashut Copper */

/* Necron Dynasty - Le techno-vert */
--imperium-teal: #4ecdc4;        /* Necron Green */
--imperium-teal-dark: #2d8f7e;    /* Moot Green */

/* Agrax Earthshade - La terre, la crasse */
--imperium-earth: #3d2b1f;        /* Agrax Earthshade */
--imperium-rust: #8b4513;         /* Rouille */
--imperium-grime: #4a3c31;        /* Crasse */

/* Nuln Oil - Les ombres sales */
--imperium-oil: #2a2a2a;          /* Nuln Oil */
--imperium-shadow: #1a1a1a;       /* Drakenhof Nightshade */
```

---

## 3. TYPOGRAPHIE: DENSE, AGRESSIVE, MULTIPLE

```css
/* === POLICE DE CARACTÈRE === */
--font-display: 'Courier Prime', 'Space Mono', monospace;  /* Tech brut */
--font-body: 'IBM Plex Mono', 'Fira Code', monospace;      /* Data terminal */
--font-accent: 'Bebas Neue', 'Anton', sans-serif;          /* Titres criards */

/* === ÉCHELLE TYPO === */
.display-hero    { font-size: clamp(48px, 15vw, 200px); line-height: 0.8; }
.display-xl      { font-size: clamp(32px, 10vw, 120px); line-height: 0.85; }
.display-lg      { font-size: clamp(24px, 6vw, 64px); line-height: 0.9; }
.heading-xl       { font-size: 32px; letter-spacing: 0.05em; text-transform: uppercase; }
.heading-lg       { font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
.body            { font-size: 14px; font-family: var(--font-body); line-height: 1.4; }
.caption         { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; }

/* === STYLES TYPO === */
.glitch-text     { animation: text-glitch 0.3s infinite; }
.distort-text    { animation: text-distort 0.5s infinite; }
.overflow-text   { overflow: visible; white-space: nowrap; }
```

---

## 4. LAYOUT: CASSÉ, DÉCALÉ, IMPARFAIT

```
┌─────────────────────────────────────┐
│  ┌────┐     ┌───┐   ┌────┐         │
│  │GITCH│     │   │   │BROKEN│      │
│  └────┘     └───┘   └────┘         │
│     ┌────────┐  ┌──────────┐       │
│     │OFFSET │  │ASYMMETRIC│       │
│     └────────┘  └──────────┘       │
│  ══════════════════════════════     │
│    TEXTURE OVERLAY - GRUNGE       │
├─────────────────────────────────────┤
│  █▀▀▀▀▀▀▀ ▄▄▄▄▄▄▄ ▀▀▀▀▀▀▀  █       │
│    GLITCH ELEMENTS                 │
└─────────────────────────────────────┘
```

**Règles de Layout Brutal**:
- **Grid cassé**: `display: grid` avec des `grid-column: span 2` aléatoires
- **Décalages**: `transform: translate(-4px, 2px) rotate(0.5deg)`
- **Z-index chaotique`: Des éléments qui se chevauchent volontairement
- **Overflow visible**: Le contenu dépasse, c'est voulu

---

## 5. EFFETS GLITCH: AGRESSIFS ET PERMANENTS

```css
/* === GLITCH SÉVÈRE === */
@keyframes severe-glitch {
  0% {
    transform: translate(0) skew(0deg);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: translate(-8px, 4px) skew(-2deg);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(8px, -4px) skew(2deg);
    filter: hue-rotate(180deg);
  }
  60% {
    transform: translate(-4px, 2px) skew(-1deg);
    filter: hue-rotate(270deg);
  }
  80% {
    transform: translate(4px, -2px) skew(1deg);
    filter: hue-rotate(360deg);
  }
  100% {
    transform: translate(0) skew(0deg);
    filter: hue-rotate(0deg);
  }
}

/* === RGB SHIFT === */
@keyframes rgb-shift {
  0%, 100% {
    text-shadow:
      -4px 0 rgba(255, 0, 0, 0.8),
      4px 0 rgba(0, 255, 255, 0.8);
  }
  25% {
    text-shadow:
      4px 0 rgba(255, 0, 0, 0.8),
      -4px 0 rgba(0, 255, 255, 0.8);
  }
  50% {
    text-shadow:
      -8px 0 rgba(255, 0, 0, 0.8),
      8px 0 rgba(0, 255, 255, 0.8);
  }
  75% {
    text-shadow:
      -4px 0 rgba(255, 0, 255, 0.8),
      4px 0 rgba(0, 255, 0, 0.8);
  }
}

/* === BLOCKS GLITCH === */
@keyframes block-glitch {
  0%, 100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  25% {
    clip-path: polygon(10% 0%, 90% 5%, 95% 95%, 5% 100%);
  }
  50% {
    clip-path: polygon(0% 10%, 100% 0%, 95% 90%, 5% 95%);
  }
  75% {
    clip-path: polygon(5% 5%, 95% 0%, 100% 95%, 0% 90%);
  }
}
```

---

## 6. COMPOSANTS: DÉCONSTRUITS

### 6.1 Button - LE BOUTON CASSÉ

```tsx
// Button avec bordure brisée, glitch au survol
<ImperiumButton variant="brutal-glitch">
  EXECUTE
</ImperiumButton>

// Rendu:
// - Bordure traitillée
// - Texte qui tremble légèrement
// - Hover = explosion de glitch + distortion
// - Click = effet de "bris" qui tombent
```

### 6.2 Card - LA CARTE MINÉRALE V2

```tsx
<GlitchCard variant="rusted">
  {/* Fragments qui dépassent */}
  <div className="absolute -top-3 -right-3 w-16 h-2 bg-imperium-crimson rotate-12" />
  <div className="absolute -bottom-2 -left-2 w-4 h-16 bg-imperium-gold rotate-45" />

  {/* Scanlines */}
  <Scanlines intensity="heavy" />

  {/* Text content */}
  <GlitchText>RELIC DATA</GlitchText>
</GlitchCard>
```

### 6.3 Navigation - LA NAV CHAOTIQUE

```tsx
// Nav flottante mais IRRÉGULIÈRE
<ChaosNav>
  {/* Icônes décalées */}
  <NavItem offset="translate(-2px, 1px) rotate(-1deg)" />
  <NavItem offset="translate(3px, -2px) rotate(2deg)" />
  <NavItem offset="translate(-1px, 3px) rotate(-0.5deg)" />
</ChaosNav>
```

---

## 7. TEXTURES: CRASSE, ROUILLE, USURE

```css
/* === NOISE TEXTURE === */
.texture-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* === GRUNGE OVERLAY === */
.texture-grunge {
  background:
    radial-gradient(circle at 20% 30%, transparent 0%, rgba(0,0,0,0.3) 100%),
    radial-gradient(circle at 80% 70%, transparent 0%, rgba(0,0,0,0.3) 100%);
}

/* === SCRATCHES === */
.texture-scratches {
  background:
    linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%, transparent 100%),
    linear-gradient(transparent 95%, rgba(255,255,255,0.05) 95%, transparent 100%);
  background-size: 100px 100%, 150px 100%;
}

/* === RUST BLEED === */
.texture-rust-bleed {
  background:
    linear-gradient(45deg, transparent 40%, rgba(139,69,19,0.3) 50%, transparent 60%);
}
```

---

## 8. ANIMATIONS: VIOLENTES, IMPRÉVISES

```css
/* === SHAKE - TREMBLEMENT PERMANENT === */
@keyframes shake-violent {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-2px, -1px) rotate(-1deg); }
  20% { transform: translate(2px, 1px) rotate(1deg); }
  30% { transform: translate(-1px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-2px, 1px) rotate(-1deg); }
  60% { transform: translate(2px, -2px) rotate(0deg); }
  70% { transform: translate(-1px, -1px) rotate(1deg); }
  80% { transform: translate(1px, 1px) rotate(-1deg); }
  90% { transform: translate(0, 2px) rotate(0deg); }
}

/* === OVERDRIVE - SATURED BURN === */
@keyframes overdrive-burn {
  0% {
    filter: brightness(1) saturate(1) contrast(1);
  }
  50% {
    filter: brightness(1.5) saturate(2) contrast(1.5);
  }
  100% {
    filter: brightness(1) saturate(1) contrast(1);
  }
}

/* === DATA CORRUPTION === */
@keyframes data-corrupt {
  0% { content: attr(data-text); }
  25% { content: attr(data-corrupt1); }
  50% { content: attr(data-text); }
  75% { content: attr(data-corrupt2); }
  100% { content: attr(data-text); }
}
```

---

## 9. EXEMPLE DE COMPOSANT: GLITCH CARD

```tsx
export function BrutalCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-imperium-charcoal p-6 border-2 border-imperium-crimson
                    overflow-hidden group">
      {/* NOISE OVERLAY */}
      <div className="absolute inset-0 texture-noise opacity-30 pointer-events-none" />

      {/* GLITCH LAYERS */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 bg-imperium-crimson/20 animate-glitch-shake" />
        <div className="absolute inset-0 bg-imperium-gold/20 animate-glitch-shake delay-100" />
      </div>

      {/* FRAGMENTS - Particules qui tombent */}
      <div className="absolute top-0 right-0 w-32 h-32">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-imperium-crimson"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 100],
              opacity: [1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              delay: Math.random() * 0.3,
              repeat: Infinity,
              repeatDelay: 1 + Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

---

## 10. IMPLEMENTATION: GLOBALS.CSS V2

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  /* === CITADEL COLORS === */
  --color-imperium-black: #1c1c1c;
  --color-imperium-black-deep: #0d0d0d;
  --color-imperium-charcoal: #2a2a2a;

  --color-imperium-crimson: #9a1115;
  --color-imperium-crimson-bright: #c21a30;

  --color-imperium-gold: #b8a646;
  --color-imperium-gold-bright: #d4af37;

  --color-imperium-metal: #7b7b7b;
  --color-imperium-metal-dark: #4a4a4a;

  --color-imperium-teal: #4ecdc4;

  --color-imperium-rust: #8b4513;
  --color-imperium-grime: #4a3c31;

  /* === RADICAL BORDER RADIUS === */
  --radius-none: 0;
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
}

/* === BASE === */
:root {
  --background: #0d0d0d;
  --foreground: #e0e0e0;
}

/* === KEYFRAMES === */
@keyframes glitch-shake {
  0%, 100% { transform: translate(0) skew(0deg); }
  20% { transform: translate(-4px, 2px) skew(-2deg); }
  40% { transform: translate(4px, -2px) skew(2deg); }
  60% { transform: translate(-2px, 1px) skew(-1deg); }
  80% { transform: translate(2px, -1px) skew(1deg); }
}

@keyframes severe-glitch {
  0%, 100% { transform: translate(0) skew(0deg); filter: hue-rotate(0deg); }
  20% { transform: translate(-8px, 4px) skew(-2deg); filter: hue-rotate(90deg); }
  40% { transform: translate(8px, -4px) skew(2deg); filter: hue-rotate(180deg); }
  60% { transform: translate(-4px, 2px) skew(-1deg); filter: hue-rotate(270deg); }
  80% { transform: translate(4px, -2px) skew(1deg); filter: hue-rotate(360deg); }
}

/* === UTILITIES === */
.glitch-permanent {
  animation: glitch-shake 0.5s infinite;
}

.glitch-severe {
  animation: severe-glitch 0.8s infinite;
}

.shake-violent {
  animation: shake-violent 0.3s infinite;
}
```

---

## 11. RÈGLES D'IMPLÉMENTATION

1. **TOUJOURS décalé**: `translate(-2px, 1px)` est le nouveau centre
2. **TOUJOURS glitché**: L'UI doit vivre, trembler, buguer
3. **TOUJOURS brut**: Aucun border-radius, aucune ombre douce
4. **TOUJOURS contrasté**: Noir sur Rouge, pas de gris intermédiaire
5. **JAMAIS clean**: Si c'est aligné, c'est raté

---

*End of Document v2.0*
