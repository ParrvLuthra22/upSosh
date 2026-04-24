import { Skeleton } from '@/components/ui/Skeleton';

export default function PlannerLoading() {
  return (
    <div
      className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6"
      aria-busy="true"
      aria-label="Loading AI Planner"
    >
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 md:px-10">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Center content */}
      <div className="w-full max-w-[720px]">
        <Skeleton className="h-3 w-40 mx-auto mb-6 rounded-full" />
        <Skeleton className="h-16 w-4/5 mx-auto mb-3" />
        <Skeleton className="h-16 w-3/5 mx-auto mb-10" />

        {/* Input canvas */}
        <Skeleton className="h-32 w-full rounded-3xl mb-6" />

        {/* Suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {[180, 160, 200].map((w) => (
            <Skeleton key={w} className="h-8 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
}
