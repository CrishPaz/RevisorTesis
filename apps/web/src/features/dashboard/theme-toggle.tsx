"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="aurora-toggle group relative flex h-9 w-full items-center justify-between rounded-md px-3 text-xs font-medium uppercase tracking-widest"
    >
      <span className="flex items-center gap-2">
        {isDark ? (
          <Moon className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Sun className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>{isDark ? "Oscuro" : "Claro"}</span>
      </span>
      <span
        aria-hidden
        className="relative inline-flex h-4 w-7 items-center rounded-full border border-[color:var(--aurora-border-strong)] bg-[color:var(--aurora-toggle-track)] transition-colors"
      >
        <span
          className={
            "absolute top-1/2 inline-block h-3 w-3 -translate-y-1/2 rounded-full bg-[color:var(--aurora-toggle-thumb)] shadow-sm transition-transform " +
            (isDark ? "translate-x-3.5" : "translate-x-0.5")
          }
        />
      </span>
    </button>
  );
}
