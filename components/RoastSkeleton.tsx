import { Skeleton } from "@/components/ui/skeleton";

export function RoastSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-5 h-3 rounded bg-white/[0.06]" />
            <Skeleton className="w-7 h-7 rounded-lg bg-white/[0.06]" />
          </div>
          <Skeleton className="mt-3 h-4 w-32 rounded bg-white/[0.06]" />
          <Skeleton className="mt-1.5 h-3 w-full rounded bg-white/[0.06]" />
          <Skeleton className="mt-1 h-3 w-3/4 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
