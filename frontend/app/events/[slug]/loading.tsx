import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-bg-primary pb-32 lg:pb-0" aria-busy="true" aria-label="Loading event details">
      {/* Back nav */}
      <div className="px-6 md:px-10 pt-24 pb-2">
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Hero */}
      <section className="px-6 md:px-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-start">
            {/* Left column */}
            <div>
              <Skeleton className="h-3 w-24 mb-5" />
              <Skeleton className="h-14 w-full mb-2" />
              <Skeleton className="h-14 w-4/5 mb-6" />
              {/* Host line */}
              <div className="flex items-center gap-3 mb-8">
                <Skeleton circle className="w-8 h-8" />
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t border-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — portrait image */}
            <div className="order-first lg:order-last">
              <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Content + booking card */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_360px] gap-16">
          {/* Left: content blocks */}
          <div className="space-y-20">
            {/* About */}
            <div>
              <Skeleton className="h-3 w-28 mb-6" />
              <Skeleton className="h-7 w-3/4 mb-6" />
              <SkeletonText lines={5} className="max-w-[640px]" />
            </div>
            {/* Timeline */}
            <div>
              <Skeleton className="h-3 w-32 mb-6" />
              <Skeleton className="h-6 w-48 mb-8" />
              <div className="hidden md:grid grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton circle className="w-2 h-2" />
                      <Skeleton className="h-px flex-1" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <SkeletonText lines={3} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: booking card */}
          <aside className="hidden lg:block">
            <div className="border border-border rounded-3xl p-6">
              <Skeleton className="h-10 w-32 mb-5" />
              <Skeleton className="h-1.5 w-full rounded-full mb-5" />
              <Skeleton className="h-12 w-full rounded-2xl mb-3" />
              <Skeleton className="h-3 w-3/4 mx-auto mb-5" />
              <div className="pt-5 border-t border-border space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton circle className="w-5 h-5" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
