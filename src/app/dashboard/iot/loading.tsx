export default function IotLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-gray-200/70 dark:bg-slate-800/70 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-sky-200/60 dark:bg-sky-900/40 rounded-xl animate-pulse" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
        {["sky", "emerald", "amber"].map((color) => (
          <div key={color} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Water Quality Section */}
      <div className="space-y-4">
        <div className="h-5 w-48 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-slate-800 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-800">
                {[1,2,3,4,5,6].map((j) => (
                  <div key={j} className="bg-white dark:bg-slate-900 p-3 space-y-1.5">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    <div className="h-2 w-20 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Predictions */}
      <div className="space-y-4">
        <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="p-5 space-y-3">
                <div className="h-20 bg-sky-50 dark:bg-sky-950/20 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((j) => (
                    <div key={j} className="h-24 bg-gray-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
