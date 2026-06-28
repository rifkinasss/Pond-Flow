export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>

      {/* Chart / Main Area Skeleton */}
      <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
}
