'use client';

import { useWorldTheme } from '@/components/theme';
import { cn } from '@/lib/utils';

interface ThemeBadgeProps {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
  className?: string;
}

export function ThemeBadge({ variant = 'primary', children, className }: ThemeBadgeProps) {
  const { colors } = useWorldTheme();

  const bgColor = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : colors.accent;

  return (
    <span
      className={cn('inline-flex items-center px-2 py-1 rounded-md text-xs font-medium', className)}
      style={{
        backgroundColor: bgColor,
        color: variant === 'accent' ? '#000' : '#fff',
      }}
    >
      {children}
    </span>
  );
}
