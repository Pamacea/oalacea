import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { QuickAction } from '@/types/component';

const quickActions: QuickAction[] = [
  {
    href: '/admin/blog/new',
    title: 'Nouvel article',
    description: 'Créer un article de blog',
  },
  {
    href: '/admin/projects/new',
    title: 'Nouveau projet',
    description: 'Ajouter un projet portfolio',
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      {quickActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex items-center gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
        >
          <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
            <Plus className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-200">{action.title}</p>
            <p className="text-xs text-zinc-500">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
