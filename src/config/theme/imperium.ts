/**
 * IMPERIUM COLOR SYSTEM
 * Unified color palette for Oalacea 3D world and UI components
 * Both HEX (for Three.js materials) and Tailwind classes (for UI) defined
 */

// ===========================================
// IMPERIUM THEME - Primary Colors
// ===========================================
export const IMPERIUM = {
  // Primary - Gold
  gold: {
    hex: 0xd4af37,
    tailwind: 'amber-500',
    light: 'amber-400',
    dark: 'amber-600',
  },

  // Secondary - Crimson (Blood)
  crimson: {
    hex: 0x8b0000,
    tailwind: 'red-900',
    light: 'red-700',
    dark: 'red-950',
  },

  // Accent - Orange (Imperium Orange)
  orange: {
    hex: 0xff4500,
    tailwind: 'orange-600',
    light: 'orange-500',
    dark: 'orange-700',
  },

  // Terminal Green (Tech/Data)
  terminal: {
    hex: 0x00ff88,
    tailwind: 'emerald-400',
    light: 'emerald-300',
    dark: 'emerald-500',
  },

  // Neutrals
  background: {
    hex: 0x0a0a0a,
    tailwind: 'slate-950',
  },
  surface: {
    hex: 0x1a1a1a,
    tailwind: 'slate-900',
  },
  border: {
    hex: 0x2a2a2a,
    tailwind: 'slate-800',
  },
  text: {
    primary: '#ffffff',
    secondary: 'slate-400',
    muted: 'slate-500',
  },
} as const;

// ===========================================
// UNDERGROUND THEME - Alternative
// ===========================================
export const UNDERGROUND = {
  // Primary - Neon Teal
  teal: {
    hex: 0x4ecdc4,
    tailwind: 'teal-400',
  },

  // Secondary - Neon Pink
  pink: {
    hex: 0xff6b6b,
    tailwind: 'rose-400',
  },

  // Accent - Neon Yellow
  yellow: {
    hex: 0xfeca57,
    tailwind: 'yellow-400',
  },

  // Background
  background: {
    hex: 0x1a1a2e,
    tailwind: 'indigo-950',
  },
} as const;

// ===========================================
// TAILWIND THEME EXTENSIONS
// ===========================================
export const tailwindTheme = {
  extend: {
    colors: {
      imperium: {
        gold: '#d4af37',
        crimson: '#8b0000',
        orange: '#ff4500',
        terminal: '#00ff88',
      },
    },
  },
} as const;

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
type ColorVariant = 'gold' | 'crimson' | 'orange' | 'terminal';

export const getImperiumClass = (
  type: ColorVariant,
  variant: 'light' | 'dark' | 'glow' | 'default' = 'default'
): string => {
  const color = IMPERIUM[type];
  switch (variant) {
    case 'light':
      return color.light;
    case 'dark':
      return color.dark;
    case 'glow':
      return `${color.tailwind}/20`;
    default:
      return color.tailwind;
  }
};

// Export hex values for Three.js materials
export const imperiumHex = {
  gold: IMPERIUM.gold.hex,
  crimson: IMPERIUM.crimson.hex,
  orange: IMPERIUM.orange.hex,
  terminal: IMPERIUM.terminal.hex,
  background: IMPERIUM.background.hex,
  surface: IMPERIUM.surface.hex,
  border: IMPERIUM.border.hex,
} as const;
