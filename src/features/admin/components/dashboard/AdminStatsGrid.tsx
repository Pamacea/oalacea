import Link from 'next/link';
import type { StatCard } from '@/types/component';

interface AdminStatsGridProps {
  stats: StatCard[];
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`h-5 w-5 ${stat.color ?? 'text-zinc-400'}`} />
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">→</span>
          </div>
          <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
          <p className="text-sm text-zinc-500">{stat.label}</p>
        </Link>
      ))}
    </div>
  );
}
