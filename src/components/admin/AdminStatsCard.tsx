'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useWorldTheme } from '@/components/theme';

interface AdminStatsCardProps {
  title: string;
  count: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function AdminStatsCard({ title, count, href, icon: Icon, color }: AdminStatsCardProps) {
  const { colors } = useWorldTheme();

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border p-6 transition-all"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
        style={{ background: color }}
      />
      <div className="relative">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ background: color }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium" style={{ color: colors.text.muted }}>
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold" style={{ color: colors.text.primary }}>
          {count}
        </p>
        <ArrowRight
          className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1"
          style={{ color: colors.text.muted }}
        />
      </div>
    </Link>
  );
}
