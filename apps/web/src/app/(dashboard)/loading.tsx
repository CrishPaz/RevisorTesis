export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-[rgba(125,211,252,0.18)]" />
        <div className="h-8 w-64 rounded bg-[rgba(125,211,252,0.22)]" />
        <div className="h-4 w-96 rounded bg-[rgba(125,211,252,0.14)]" />
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aurora-surface rounded-xl p-4 h-24 flex flex-col justify-between"
          >
            <div className="h-3 w-20 rounded bg-[rgba(125,211,252,0.18)]" />
            <div className="h-7 w-12 rounded bg-[rgba(125,211,252,0.22)]" />
          </div>
        ))}
      </section>

      <div className="aurora-surface rounded-xl p-6 space-y-4">
        <div className="h-4 w-40 rounded bg-[rgba(125,211,252,0.22)]" />
        <div className="h-3 w-64 rounded bg-[rgba(125,211,252,0.14)]" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-full rounded-lg bg-[rgba(125,211,252,0.10)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
