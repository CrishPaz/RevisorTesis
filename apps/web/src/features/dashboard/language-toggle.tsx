"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";

import { setLocaleAction } from "@/lib/i18n/actions";
import { useLocale, useTranslations } from "@/lib/i18n/locale-provider";

export function LanguageToggle() {
  const { locale } = useLocale();
  const t = useTranslations();
  const [pending, start] = useTransition();
  const isEs = locale === "es";

  function flip() {
    if (pending) return;
    start(async () => {
      await setLocaleAction(isEs ? "en" : "es");
    });
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-label={isEs ? t("locale.aria.switchToEn") : t("locale.aria.switchToEs")}
      title={isEs ? "English" : "Español"}
      className="aurora-toggle group relative flex h-9 w-full items-center justify-between rounded-md px-3 text-xs font-medium uppercase tracking-widest disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        <Languages className="h-3.5 w-3.5" aria-hidden />
        <span>{isEs ? t("locale.es") : t("locale.en")}</span>
      </span>
      <span
        aria-hidden
        className="relative inline-flex h-4 w-7 items-center rounded-full border border-[color:var(--aurora-border-strong)] bg-[color:var(--aurora-toggle-track)] transition-colors"
      >
        <span
          className={
            "absolute top-1/2 inline-block h-3 w-3 -translate-y-1/2 rounded-full bg-[color:var(--aurora-toggle-thumb)] shadow-sm transition-transform " +
            (isEs ? "translate-x-0.5" : "translate-x-3.5")
          }
        />
      </span>
    </button>
  );
}
