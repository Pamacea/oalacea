'use client';

import Link from 'next/link';
import { Plus, Skull, Zap } from 'lucide-react';
import { GlitchText } from '@/components/ui/imperium';
import { motion } from 'framer-motion';
import type { QuickAction } from '@/types/component';

const quickActions: QuickAction[] = [
  {
    href: '/admin/blog/new',
    title: 'NEW ARCHIVE ENTRY',
    description: 'Initialize blog post creation sequence',
    icon: 'skull',
  },
  {
    href: '/admin/projects/new',
    title: 'NEW BLUEPRINT',
    description: 'Forge new project into reality',
    icon: 'zap',
  },
];

const iconMap = {
  skull: Skull,
  zap: Zap,
  plus: Plus,
};

export function QuickActions() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 mb-8">
      {quickActions.map((action, index) => {
        const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;

        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <Link
              href={action.href}
              className="group relative block border-2 border-imperium-steel-dark bg-imperium-black-deep overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-6 h-6 bg-imperium-crimson/20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-imperium-gold/20" />

              <motion.div
                className="absolute inset-0 bg-imperium-crimson/5"
                initial={false}
                whileHover={{
                  opacity: [0, 0.1, 0.05, 0.12, 0],
                  transition: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 1] },
                }}
              />

              <div className="relative p-6 flex items-center gap-4">
                <motion.div
                  className="p-3 border-2 border-imperium-steel-dark bg-imperium-black group-hover:border-imperium-crimson group-hover:bg-imperium-crimson/10"
                  whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="h-6 w-6 text-imperium-steel group-hover:text-imperium-crimson transition-colors" />
                </motion.div>

                <div className="flex-1">
                  <p className="font-display text-sm uppercase tracking-wider text-imperium-bone group-hover:text-imperium-crimson transition-colors">
                    <GlitchText intensity="low">{action.title}</GlitchText>
                  </p>
                  <p className="font-terminal text-xs text-imperium-steel-dark mt-1">
                    {'>'} {action.description}
                  </p>
                </div>

                <div className="text-imperium-steel-dark group-hover:text-imperium-crimson transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-imperium-crimson"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
