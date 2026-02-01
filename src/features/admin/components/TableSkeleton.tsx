import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 3 }: TableSkeletonProps) {
  return (
    <div className="border-2 border-imperium-steel-dark rounded-none overflow-hidden">
      <div className="border-b-2 border-imperium-steel-dark bg-imperium-black px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 bg-imperium-steel/20" />
          ))}
        </div>
      </div>
      <div className="divide-y-2 divide-imperium-steel-dark">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-48 bg-imperium-steel/20" />
              <Skeleton className="h-4 w-24 bg-imperium-steel/20" />
              <Skeleton className="h-4 w-16 ml-auto bg-imperium-steel/20" />
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
        <div key={i} className="border-2 border-imperium-steel-dark rounded-none bg-imperium-black p-4">
          <Skeleton className="w-full aspect-video rounded-none mb-3 bg-imperium-steel/20" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-32 bg-imperium-steel/20" />
              <Skeleton className="h-4 w-full bg-imperium-steel/20" />
              <Skeleton className="h-4 w-2/3 bg-imperium-steel/20" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-none bg-imperium-steel/20" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-none bg-imperium-steel/20" />
              <Skeleton className="h-8 w-8 rounded-none bg-imperium-steel/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
