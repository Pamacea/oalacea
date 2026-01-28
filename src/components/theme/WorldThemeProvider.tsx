'use client';

import { createContext, useContext, useMemo, useEffect, type ReactNode } from 'react';

interface WorldThemeContextValue {
  isDark: boolean;
}

const WorldThemeContext = createContext<WorldThemeContextValue | undefined>(undefined);

interface WorldThemeProviderProps {
  children: ReactNode;
}

export function WorldThemeProvider({ children }: WorldThemeProviderProps) {
  // Always dark mode - unified zinc theme
  const value = useMemo<WorldThemeContextValue>(
    () => ({
      isDark: true,
    }),
    []
  );

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
    return { isDark: true };
  }
  return context;
}
