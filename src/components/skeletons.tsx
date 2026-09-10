function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

function GradientHeroSkeleton() {
  return (
    <div className="gradient-hero py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SkeletonBlock className="h-10 w-64 rounded-lg" />
        <SkeletonBlock className="mt-4 h-4 w-40 rounded" />
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <>
      <GradientHeroSkeleton />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card">
              <SkeletonBlock className="h-[420px] w-full rounded-xl" />
              <div className="mt-6 flex gap-6">
                <SkeletonBlock className="aspect-[4/5] w-40 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <SkeletonBlock className="h-5 w-3/4 rounded" />
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-5/6 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <SkeletonBlock className="h-6 w-28 rounded" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonBlock className="h-3 w-16 rounded" />
                      <SkeletonBlock className="h-4 w-28 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <SkeletonBlock className="mt-6 h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ActivityDetailSkeleton() {
  return <EventDetailSkeleton />;
}

export function ListPageSkeleton() {
  return (
    <>
      <GradientHeroSkeleton />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <SkeletonBlock className="aspect-[4/5] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <SkeletonBlock className="h-5 w-3/4 rounded" />
                <SkeletonBlock className="h-4 w-1/2 rounded" />
                <div className="flex gap-3 pt-2">
                  <SkeletonBlock className="h-10 flex-1 rounded-lg" />
                  <SkeletonBlock className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function ScheduleSkeleton() {
  return (
    <>
      <GradientHeroSkeleton />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <SkeletonBlock className="h-6 w-24 rounded" />
              <div className="mt-4 space-y-3">
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-2/3 rounded" />
                <SkeletonBlock className="h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function LocationSkeleton() {
  return (
    <>
      <GradientHeroSkeleton />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <SkeletonBlock className="h-[520px] w-full rounded-2xl" />
          <div className="space-y-4">
            <SkeletonBlock className="h-8 w-48 rounded-lg" />
            <SkeletonBlock className="h-4 w-full rounded" />
            <SkeletonBlock className="h-4 w-5/6 rounded" />
            <SkeletonBlock className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>
    </>
  );
}
