import { Skeleton, SkeletonStatCard, SkeletonText } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-bg-primary" aria-busy="true" aria-label="Loading dashboard">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-bg-secondary border-r border-border h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-border">
          <Skeleton className="h-5 w-24" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton circle className="w-4 h-4" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Skeleton circle className="w-9 h-9" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-12 space-y-10">
          {/* Greeting */}
          <div>
            <Skeleton className="h-12 w-2/3 max-w-sm mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>

          {/* Events heading + horizontal scroll */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] border border-border rounded-2xl overflow-hidden">
                  <Skeleton className="h-[140px] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Revenue chart */}
          <div className="border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-8 w-36 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-1">
                {['7D', '30D', '3M', 'All'].map((r) => (
                  <Skeleton key={r} className="h-7 w-10 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="w-full rounded-xl" style={{ height: 200 }} />
          </div>

          {/* Activity feed */}
          <div className="border border-border rounded-2xl p-6">
            <Skeleton className="h-3 w-32 mb-5" />
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 pl-1">
                  <Skeleton circle className="w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full max-w-xs" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
