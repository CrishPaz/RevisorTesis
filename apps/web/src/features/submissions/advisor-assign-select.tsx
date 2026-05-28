"use client";

import { useTransition } from "react";

import { assignAdvisorAction } from "@/lib/api/submissions";
import type { AdvisorOption } from "@/lib/api/submissions";
import { useTranslations } from "@/lib/i18n/locale-provider";

export function AdvisorAssignSelect({
  submissionId,
  currentAdvisorId,
  advisors,
}: {
  submissionId: string;
  currentAdvisorId: string | null;
  advisors: AdvisorOption[];
}) {
  const [pending, start] = useTransition();
  const t = useTranslations();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value || null;
    start(async () => {
      await assignAdvisorAction(submissionId, value);
    });
  }

  return (
    <select
      value={currentAdvisorId ?? ""}
      onChange={onChange}
      disabled={pending}
      className="flex h-9 min-w-[14rem] rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] dark:focus-visible:ring-sky-500/40"
    >
      <option value="">{t("submission.toolbar.advisor.unassigned")}</option>
      {advisors.map((a) => (
        <option key={a.id} value={a.id}>
          {a.full_name}
          {a.orcid_linked
            ? t("submission.toolbar.advisor.orcid")
            : t("submission.toolbar.advisor.noOrcid")}
        </option>
      ))}
    </select>
  );
}
