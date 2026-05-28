"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/lib/auth/actions";
import { ROLE_LABEL_KEYS, type CurrentUser } from "@/lib/auth/types";
import { cn } from "@/lib/cn";
import { NAV_BY_ROLE } from "@/features/dashboard/nav-items";
import { LanguageToggle } from "@/features/dashboard/language-toggle";
import { ThemeToggle } from "@/features/dashboard/theme-toggle";
import { useTranslations } from "@/lib/i18n/locale-provider";

export function Sidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[user.role];
  const t = useTranslations();

  return (
    <aside className="aurora-sidebar relative z-10 flex h-screen w-64 flex-col border-r">
      <div className="aurora-sidebar-divider border-b px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-sky-300 text-xs font-bold text-zinc-950 shadow-[0_0_18px_-4px_rgba(14,165,233,0.6)]">
            T
          </span>
          <p className="aurora-display text-xl font-semibold tracking-tight text-[color:var(--aurora-cream)]">
            {t("brand.name")}
          </p>
        </div>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[color:var(--aurora-cream-dim)]">
          {t("brand.tagline")}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-[color:var(--aurora-cream)] [background:var(--aurora-active-bg)] [box-shadow:var(--aurora-active-shadow)]"
                  : "text-[color:var(--aurora-cream-dim)] hover:bg-[color:var(--aurora-hover-bg)] hover:text-[color:var(--aurora-cream)]",
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-gradient-to-b from-sky-300 to-sky-500"
                />
              ) : null}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="aurora-sidebar-divider border-t p-4 space-y-3">
        <div>
          <p
            className="truncate text-sm font-medium text-[color:var(--aurora-cream)]"
            title={user.full_name}
          >
            {user.full_name}
          </p>
          <p
            className="truncate text-xs text-[color:var(--aurora-cream-dim)]"
            title={user.email}
          >
            {user.email}
          </p>
          <p className="mt-2 inline-flex items-center rounded-full border border-[color:rgba(125,211,252,0.25)] bg-[rgba(14,165,233,0.12)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[color:var(--aurora-primary-soft)]">
            {t(ROLE_LABEL_KEYS[user.role])}
          </p>
        </div>

        {/* Theme + Language side by side */}
        <div className="grid grid-cols-2 gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="aurora-btn-ghost flex h-9 w-full items-center justify-center rounded-md text-xs font-medium uppercase tracking-widest"
          >
            {t("auth.signOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}
