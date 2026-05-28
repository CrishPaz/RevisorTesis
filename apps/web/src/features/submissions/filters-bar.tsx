"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  PROGRAM_LEVEL_LABELS,
  type Program,
  type SubmissionStatus,
} from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n";

const STATUS_VALUES: SubmissionStatus[] = [
  "draft",
  "in_progress",
  "observed",
  "approved",
  "rejected",
];

const STATUS_KEYS: Record<SubmissionStatus, MessageKey> = {
  draft: "submission.status.draft",
  in_progress: "submission.status.in_progress",
  observed: "submission.status.observed",
  approved: "submission.status.approved",
  rejected: "submission.status.rejected",
};

const SELECT_CLASS =
  "flex h-9 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] dark:focus-visible:ring-sky-500/40";

export function FiltersBar({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const t = useTranslations();

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`?${next.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select
        value={params.get("program_id") ?? ""}
        onChange={(e) => set("program_id", e.target.value || null)}
        className={SELECT_CLASS}
        disabled={pending}
      >
        <option value="">{t("submission.filters.allPrograms")}</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            [{p.code}] {p.name} — {PROGRAM_LEVEL_LABELS[p.level]}
          </option>
        ))}
      </select>

      <select
        value={params.get("status") ?? ""}
        onChange={(e) => set("status", e.target.value || null)}
        className={SELECT_CLASS}
        disabled={pending}
      >
        <option value="">{t("submission.filters.anyStatus")}</option>
        {STATUS_VALUES.map((s) => (
          <option key={s} value={s}>
            {t(STATUS_KEYS[s])}
          </option>
        ))}
      </select>

      <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
        <input
          type="checkbox"
          checked={params.get("fit_alert") === "true"}
          onChange={(e) => set("fit_alert", e.target.checked ? "true" : null)}
          disabled={pending}
        />
        {t("submission.filters.fitAlert")}
      </label>

      {params.toString() ? (
        <button
          type="button"
          onClick={() => start(() => router.replace("?"))}
          disabled={pending}
          className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-[color:rgba(125,211,252,0.12)] dark:text-[color:var(--aurora-cream-dim)] dark:hover:bg-[rgba(14,165,233,0.12)]"
        >
          {t("submission.filters.clear")}
        </button>
      ) : null}
    </div>
  );
}
