'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

const worldFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'DEV', label: 'Dev' },
  { value: 'ART', label: 'Art' },
] as const;

interface WorldFilterToggleProps {
  currentFilter: 'all' | 'DEV' | 'ART';
}

export function WorldFilterToggle({ currentFilter }: WorldFilterToggleProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getHref = (filter: typeof worldFilters[number]['value']) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('world');
    } else {
      params.set('world', filter);
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <div className="flex items-center rounded-lg bg-zinc-900/50 border border-zinc-800 p-1">
      {worldFilters.map((filter) => {
        const isActive = currentFilter === filter.value;
        return (
          <Link
            key={filter.value}
            href={getHref(filter.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              isActive
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
