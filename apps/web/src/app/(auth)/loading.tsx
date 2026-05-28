export default function AuthLoading() {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 animate-pulse">
      <section className="space-y-6">
        <div className="h-6 w-40 rounded-full bg-[rgba(125,211,252,0.18)]" />
        <div className="space-y-3">
          <div className="h-16 w-full rounded bg-[rgba(125,211,252,0.22)]" />
          <div className="h-16 w-5/6 rounded bg-[rgba(125,211,252,0.22)]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-[rgba(125,211,252,0.14)]" />
      </section>

      <section className="lg:justify-self-end w-full max-w-md">
        <div className="aurora-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="h-3 w-32 rounded bg-[rgba(125,211,252,0.18)]" />
          <div className="h-6 w-48 rounded bg-[rgba(125,211,252,0.22)]" />
          <div className="h-3 w-56 rounded bg-[rgba(125,211,252,0.14)]" />
          <div className="space-y-3 pt-2">
            <div className="h-10 w-full rounded-md bg-[rgba(125,211,252,0.12)]" />
            <div className="h-10 w-full rounded-md bg-[rgba(125,211,252,0.12)]" />
            <div className="h-10 w-full rounded-md bg-[rgba(14,165,233,0.30)]" />
          </div>
        </div>
      </section>
    </div>
  );
}
