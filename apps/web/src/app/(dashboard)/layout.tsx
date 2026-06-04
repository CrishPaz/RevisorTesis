import { redirect } from "next/navigation";

import { DashboardContent } from "@/features/dashboard/dashboard-content";
import { Sidebar } from "@/features/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="aurora-app relative isolate flex h-screen overflow-hidden text-[color:var(--aurora-cream)]">
      <div className="aurora-grid pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-0 top-0 -z-10 h-[520px] w-[520px] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[520px] w-[520px] bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.1),transparent_60%)]"
        aria-hidden
      />
      <Sidebar user={user} />
      <DashboardContent>{children}</DashboardContent>
    </div>
  );
}
