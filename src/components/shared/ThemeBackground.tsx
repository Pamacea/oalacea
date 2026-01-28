'use client';

import { useWorldTheme } from '@/components/theme';

interface ThemeBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function ThemeBackground({ className = '', children }: ThemeBackgroundProps) {
  const { colors, isDark } = useWorldTheme();

  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.background,
        color: colors.text.primary,
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}

interface ThemeSurfaceProps {
  className?: string;
  children?: React.ReactNode;
}

export function ThemeSurface({ className = '', children }: ThemeSurfaceProps) {
  const { colors } = useWorldTheme();

  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {children}
    </div>
  );
}
