"use client";

import { usePathname } from "next/navigation";

const IMMERSIVE_SUFFIX = "/viewer";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname.endsWith(IMMERSIVE_SUFFIX);

  if (immersive) {
    return (
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-8 py-10">
      {children}
    </main>
  );
}
