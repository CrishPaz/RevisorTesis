import { redirect } from "next/navigation";

import { AuthHeaderControls } from "@/features/auth/auth-header-controls";
import { ROLE_HOMES } from "@/lib/auth/types";
import { getSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, { t }] = await Promise.all([getSession(), getMessages()]);
  if (session) {
    redirect(ROLE_HOMES[session.role]);
  }

  return (
    <main className="aurora-shell relative isolate min-h-screen overflow-hidden">
      <div className="aurora-grid absolute inset-0 z-0" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[60vh] bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.35),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[60vh] bg-[radial-gradient(circle_at_90%_85%,rgba(125,211,252,0.18),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-sky-300 text-sm font-bold text-zinc-950 shadow-[0_0_30px_-6px_rgba(14,165,233,0.7)]">
              T
            </span>
            <span className="aurora-display text-lg font-semibold tracking-tight text-[color:var(--aurora-cream)]">
              {t("brand.name")}
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-[color:var(--aurora-cream-dim)] sm:flex">
            <span>{t("auth.pill.review")}</span>
            <span>{t("auth.pill.evidence")}</span>
            <span>{t("auth.pill.rigor")}</span>
          </nav>
          <div className="flex items-center gap-3">
            <AuthHeaderControls />
            <a
              href="mailto:soporte@tesis.unt.edu.pe"
              className="hidden rounded-full border border-[color:rgba(125,211,252,0.3)] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[color:var(--aurora-cream)] transition hover:bg-[color:rgba(14,165,233,0.15)] sm:inline-flex"
            >
              {t("auth.support")}
            </a>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-16">
          {children}
        </div>

        <footer className="flex flex-col items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--aurora-cream-dim)] sm:flex-row">
          <span>{t("auth.footer.institution")}</span>
          <span>{t("auth.footer.product")}</span>
        </footer>
      </div>
    </main>
  );
}
