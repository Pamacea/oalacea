// Simplified - unified theme only
export interface WorldTheme {
  name: string;
  mode: 'dark' | 'light';
}

export const UNIFIED_THEME: WorldTheme = {
  name: 'unified',
  mode: 'dark',
};

export function getWorldTheme(): WorldTheme {
  return UNIFIED_THEME;
}
