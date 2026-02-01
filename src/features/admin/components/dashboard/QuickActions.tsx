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
          className="flex items-center gap-3 p-4 border-2 border-imperium-steel-dark rounded-none bg-imperium-black hover:border-imperium-crimson hover:shadow-[4px_4px_0_rgba(154,17,21,0.3)] transition-all group"
        >
          <div className="p-2 border-2 border-imperium-steel-dark rounded-none bg-imperium-iron group-hover:border-imperium-crimson group-hover:bg-imperium-crimson/20 transition-colors">
            <Plus className="h-4 w-4 text-imperium-steel group-hover:text-imperium-crimson" />
          </div>
          <div>
            <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">{action.title}</p>
            <p className="font-terminal text-xs text-imperium-steel-dark">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
