export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-full animate-pulse" />
          <div className="h-8 w-60 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-gradient-to-r from-sky-200/60 to-cyan-200/60 dark:from-sky-900/40 dark:to-cyan-900/40 rounded-xl animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        {[
          { accent: "from-sky-400/20 to-cyan-400/10 dark:from-sky-900/30 dark:to-cyan-900/20" },
          { accent: "from-emerald-400/20 to-teal-400/10 dark:from-emerald-900/30 dark:to-teal-900/20" },
          { accent: "from-violet-400/20 to-purple-400/10 dark:from-violet-900/30 dark:to-purple-900/20" },
          { accent: "from-amber-400/20 to-orange-400/10 dark:from-amber-900/30 dark:to-orange-900/20" },
        ].map((card, i) => (
          <div
            key={i}
            className={`relative h-36 rounded-2xl overflow-hidden bg-gradient-to-br ${card.accent} border border-white/60 dark:border-gray-800 shadow-sm`}
          >
            {/* Icon placeholder */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/40 dark:bg-white/5 animate-pulse" />
            {/* Content lines */}
            <div className="absolute bottom-5 left-5 space-y-2">
              <div className="h-3 w-20 bg-gray-300/60 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-7 w-28 bg-gray-300/80 dark:bg-gray-600 rounded-lg animate-pulse" />
            </div>
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        ))}
      </div>

      {/* Chart Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main chart */}
        <div className="lg:col-span-2 h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800/80 dark:to-slate-900 border border-gray-200/60 dark:border-gray-800 relative">
          {/* Chart title */}
          <div className="absolute top-5 left-5 space-y-2">
            <div className="h-4 w-40 bg-gray-300/70 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-gray-200/70 dark:bg-gray-700/70 rounded-full animate-pulse" />
          </div>
          {/* Fake bar chart */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end gap-3 h-32">
            {[65, 45, 80, 55, 90, 40, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-sky-300/60 to-sky-200/30 dark:from-sky-700/40 dark:to-sky-800/20 animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800/80 dark:to-slate-900 border border-gray-200/60 dark:border-gray-800 p-5 space-y-4">
          <div className="h-4 w-32 bg-gray-300/70 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" style={{ width: `${60 + i * 8}%` }} />
                  <div className="h-2.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="h-48 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800/80 dark:to-slate-900 border border-gray-200/60 dark:border-gray-800 animate-pulse" />
    </div>
  );
}
