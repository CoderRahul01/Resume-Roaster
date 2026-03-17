import { Skeleton } from "@/components/ui/skeleton";

export function RoastSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/60 border-l-4 border-l-zinc-700"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 bg-zinc-800" />
              <Skeleton className="h-3 w-full bg-zinc-800" />
              <Skeleton className="h-3 w-3/4 bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
