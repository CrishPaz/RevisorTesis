"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  type SubmissionStatus,
  type SubmissionSummary,
  type VersionParsingStatus,
} from "@/lib/api/types";
import { useTranslations, useCurrentLocale } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n";

type SortKey =
  | "student"
  | "title"
  | "chapter"
  | "grade"
  | "percentage"
  | "findings"
  | "status"
  | "created_at";

type SortDir = "asc" | "desc";

const COLS: { key: SortKey; labelKey: MessageKey; align?: "right" }[] = [
  { key: "student", labelKey: "submission.table.col.student" },
  { key: "title", labelKey: "submission.table.col.title" },
  { key: "chapter", labelKey: "submission.table.col.chapter" },
  { key: "grade", labelKey: "submission.table.col.grade", align: "right" },
  { key: "percentage", labelKey: "submission.table.col.percentage", align: "right" },
  { key: "findings", labelKey: "submission.table.col.findings", align: "right" },
  { key: "status", labelKey: "submission.table.col.status" },
  { key: "created_at", labelKey: "submission.table.col.createdAt" },
];

const SUBMISSION_STATUS_KEYS: Record<SubmissionStatus, MessageKey> = {
  draft: "submission.status.draft",
  in_progress: "submission.status.in_progress",
  observed: "submission.status.observed",
  approved: "submission.status.approved",
  rejected: "submission.status.rejected",
};

const VERSION_STATUS_KEYS: Record<VersionParsingStatus, MessageKey> = {
  pending: "submission.versionStatus.pending",
  processing: "submission.versionStatus.processing",
  parsed: "submission.versionStatus.parsed",
  failed: "submission.versionStatus.failed",
  ai_queued: "submission.versionStatus.ai_queued",
  ai_processing: "submission.versionStatus.ai_processing",
  ai_completed: "submission.versionStatus.ai_completed",
};

function cmp(a: unknown, b: unknown, collator: Intl.Collator): number {
  // Nulls go last regardless of direction so the user always sees the
  // populated rows first on a fresh sort.
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

function gradeTone(grade: number | null): string {
  if (grade == null) return "text-zinc-400";
  if (grade >= 14) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (grade >= 11) return "text-amber-600 dark:text-amber-400 font-semibold";
  return "text-rose-600 dark:text-rose-400 font-semibold";
}

export function ComparisonTable({
  submissions,
  basePath,
}: {
  submissions: SubmissionSummary[];
  basePath: string;
}) {
  const t = useTranslations();
  const locale = useCurrentLocale();
  const dateLocale = locale === "es" ? "es-PE" : "en-US";
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...submissions];
    const collator = new Intl.Collator(locale, { sensitivity: "base" });
    const get = (s: SubmissionSummary): unknown => {
      switch (sortKey) {
        case "student":
          return s.student.full_name;
        case "title":
          return s.title;
        case "chapter":
          return s.chapter;
        case "grade":
          return s.latest_grade;
        case "percentage":
          return s.latest_percentage;
        case "findings":
          return s.findings_count;
        case "status":
          return t(SUBMISSION_STATUS_KEYS[s.status]);
        case "created_at":
          return s.created_at;
      }
    };
    arr.sort((a, b) => {
      const r = cmp(get(a), get(b), collator);
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [submissions, sortKey, sortDir, t, locale]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "student" || k === "title" || k === "chapter" ? "asc" : "desc");
    }
  }

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">{t("submission.table.empty")}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left dark:border-[color:rgba(125,211,252,0.15)]">
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className={cn(
                  "cursor-pointer select-none py-2 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-[color:var(--aurora-cream)]",
                  c.align === "right" && "text-right",
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {t(c.labelKey)}
                  {sortKey === c.key ? (
                    <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>
                  ) : null}
                </span>
              </th>
            ))}
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const grade = s.latest_grade;
            const pct = s.latest_percentage;
            const fc = s.findings_count;
            return (
              <tr
                key={s.id}
                className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-[color:rgba(125,211,252,0.08)] dark:hover:bg-[rgba(14,165,233,0.06)]"
              >
                <td className="py-3 px-3">
                  <p className="font-medium">{s.student.full_name}</p>
                  <p className="text-xs text-zinc-500">{s.student.email}</p>
                </td>
                <td className="py-3 px-3">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-zinc-500">
                    [{s.program.code}] {s.program.name}
                  </p>
                </td>
                <td className="py-3 px-3 text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
                  {s.chapter ?? "—"}
                </td>
                <td className={cn("py-3 px-3 text-right tabular-nums", gradeTone(grade))}>
                  {grade != null
                    ? t("submission.table.gradeOver20", { n: grade.toFixed(2) })
                    : "—"}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
                  {pct != null ? `${pct.toFixed(1)}%` : "—"}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">
                  {fc != null ? (
                    <Badge variant={fc === 0 ? "muted" : fc > 5 ? "warning" : "default"}>
                      {fc}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        s.status === "approved"
                          ? "success"
                          : s.status === "rejected"
                            ? "destructive"
                            : s.status === "observed"
                              ? "warning"
                              : "outline"
                      }
                    >
                      {t(SUBMISSION_STATUS_KEYS[s.status])}
                    </Badge>
                    {s.latest_version_status ? (
                      <span className="text-[10px] text-zinc-500">
                        {t(VERSION_STATUS_KEYS[s.latest_version_status])}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="py-3 px-3 text-xs text-zinc-500">
                  {new Date(s.created_at).toLocaleDateString(dateLocale)}
                </td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href={`${basePath}/${s.id}`}
                    className="text-sm font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                  >
                    {t("submission.table.review")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
