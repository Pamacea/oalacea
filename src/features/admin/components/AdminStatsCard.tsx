'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatsCardProps {
  title: string;
  count: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "crimson" | "gold" | "warp" | "iron";
}

export function AdminStatsCard({ title, count, href, icon: Icon, color = "crimson" }: AdminStatsCardProps) {
  const colorMap = {
    crimson: "bg-imperium-crimson border-imperium-crimson-dark",
    gold: "bg-imperium-gold border-imperium-gold-dark",
    warp: "bg-imperium-warp border-imperium-warp-bright",
    iron: "bg-imperium-iron border-imperium-iron-dark",
  };

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-none border-2 p-6 transition-all block"
      style={{ backgroundColor: 'var(--imperium-black)', borderColor: 'var(--imperium-steel-dark)' }}
    >
      {/* Overlay color on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20"
        style={{ background: color === "crimson" ? "#9a1115" : color === "gold" ? "#b8a646" : color === "warp" ? "#2a3a5a" : "#3a3a3a" }}
      />

      <div className="relative">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-none border-2 text-imperium-bone",
            colorMap[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="font-terminal text-sm text-imperium-steel">
          {title}
        </p>
        <p className="mt-2 text-3xl font-display font-bold text-imperium-bone">
          {count}
        </p>
        <ArrowRight
          className="mt-4 h-5 w-5 text-imperium-steel transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
