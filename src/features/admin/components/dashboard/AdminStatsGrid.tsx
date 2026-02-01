'use client';

import Link from 'next/link';
import { PenTool, FolderOpen, BarChart3, Users, Activity } from 'lucide-react';
import { MineralCard, MineralCardTitle, MineralCardContent } from '@/components/ui/imperium';
import { motion } from 'framer-motion';
import type { StatCard } from '@/types/component';

interface AdminStatsGridProps {
  stats: StatCard[];
}

const iconMap = {
  'pen-tool': PenTool,
  'folder-open': FolderOpen,
  'bar-chart': BarChart3,
  'users': Users,
  'activity': Activity,
} as const;

const variantMap = {
  'text-imperium-crimson': 'crimson' as const,
  'text-imperium-gold': 'gold' as const,
  'text-imperium-teal': 'brutal' as const,
};

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => {
        const variant = variantMap[stat.color as keyof typeof variantMap] || 'crimson';
        const Icon = iconMap[stat.icon] || FolderOpen;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Link href={stat.href} className="block">
              <MineralCard
                variant={variant}
                padding="md"
                className="group hover:shadow-[8px_8px_0_rgba(154,17,21,0.4)] transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 border-2 border-imperium-steel-dark ${stat.bgColor} group-hover:border-imperium-crimson transition-colors`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="font-terminal text-xs text-imperium-steel-dark group-hover:text-imperium-crimson transition-colors">
                    {'>>>'}
                  </span>
                </div>
                <MineralCardTitle className="text-4xl font-bold">
                  {stat.value}
                </MineralCardTitle>
                <MineralCardContent className="font-terminal text-xs text-imperium-steel-dark uppercase tracking-wider mt-2">
                  [{stat.label}]
                </MineralCardContent>
              </MineralCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
