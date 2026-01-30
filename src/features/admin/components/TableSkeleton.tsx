import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 3 }: TableSkeletonProps) {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-zinc-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-48 bg-zinc-800" />
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-4 w-16 ml-auto bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CardGridSkeletonProps {
  cards?: number;
}

export function CardGridSkeleton({ cards = 4 }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-4">
          <Skeleton className="w-full aspect-video rounded-lg mb-3 bg-zinc-800" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-32 bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-2/3 bg-zinc-800" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-full bg-zinc-800" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
              <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
