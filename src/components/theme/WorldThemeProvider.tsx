'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';

interface Colors {
  background: string;
  surface: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  text: {
    primary: string;
    secondary: string;
  };
}

interface WorldThemeContextValue {
  isDark: boolean;
  colors: Colors;
}

const darkColors: Colors = {
  background: '#09090b',
  surface: '#18181b',
  border: '#27272a',
  primary: '#d4af37', // gold accent
  secondary: '#6366f1', // indigo accent
  accent: '#10b981', // emerald accent
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
  },
};

const WorldThemeContext = createContext<WorldThemeContextValue | undefined>(undefined);

interface WorldThemeProviderProps {
  children: ReactNode;
}

export function WorldThemeProvider({ children }: WorldThemeProviderProps) {
  // Always dark mode - unified zinc theme
  const value: WorldThemeContextValue = {
    isDark: true,
    colors: darkColors,
  };

  // Apply dark class to html - client side only
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
  }, []);

  return (
    <WorldThemeContext.Provider value={value}>
      {children}
    </WorldThemeContext.Provider>
  );
}

export function useWorldTheme(): WorldThemeContextValue {
  const context = useContext(WorldThemeContext);
  if (!context) {
    return { isDark: true, colors: darkColors };
  }
  return context;
}
