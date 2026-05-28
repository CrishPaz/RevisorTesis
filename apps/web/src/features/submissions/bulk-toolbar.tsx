"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkApplyAction,
  fetchSubmissionStatusMap,
  type BulkResponse,
} from "@/lib/api/submissions";
import type { AdvisorOption } from "@/lib/api/submissions";
import { type SubmissionStatus } from "@/lib/api/types";
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

export function BulkToolbar({
  selectedIds,
  onClear,
  advisors,
}: {
  selectedIds: string[];
  onClear: () => void;
  advisors: AdvisorOption[];
}) {
  const t = useTranslations();
  const [operation, setOperation] = useState<
    "reprocess_ai" | "set_status" | "assign_advisor"
  >("reprocess_ai");
  const [status, setStatus] = useState<SubmissionStatus>("in_progress");
  const [advisorId, setAdvisorId] = useState<string>("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<BulkResponse | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const csvHref = useMemo(() => {
    if (selectedIds.length === 0) return "";
    const qs = selectedIds.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
    return `/api/submissions/batch-report.csv?${qs}`;
  }, [selectedIds]);

  // Poll only when we just kicked off a reprocess.
  useEffect(() => {
    if (!result || result.operation !== "reprocess_ai" || selectedIds.length === 0) {
      setProgress(null);
      return;
    }
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = async () => {
      const map = await fetchSubmissionStatusMap(selectedIds);
      const done = selectedIds.filter((id) => {
        const s = map[id];
        return s === "ai_completed" || s === "failed";
      }).length;
      if (cancelled) return;
      setProgress({ done, total: selectedIds.length });
      if (done >= selectedIds.length && interval) {
        clearInterval(interval);
      }
    };
    tick();
    interval = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [result, selectedIds]);

  function execute() {
    setResult(null);
    setProgress(null);
    start(async () => {
      const res = await bulkApplyAction({
        operation,
        submission_ids: selectedIds,
        status: operation === "set_status" ? status : null,
        advisor_id: operation === "assign_advisor" ? advisorId || null : null,
      });
      setResult(res);
    });
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-2 z-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(11,31,51,0.55)]">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>
          {selectedIds.length === 1
            ? t("submission.toolbar.selectedOne", { n: selectedIds.length })
            : t("submission.toolbar.selected", { n: selectedIds.length })}
        </Badge>

        <select
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value as typeof operation);
            setResult(null);
          }}
          className={SELECT_CLASS}
          disabled={pending}
        >
          <option value="reprocess_ai">{t("submission.toolbar.op.reprocess")}</option>
          <option value="set_status">{t("submission.toolbar.op.setStatus")}</option>
          <option value="assign_advisor">{t("submission.toolbar.op.assignAdvisor")}</option>
        </select>

        {operation === "set_status" ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
            className={SELECT_CLASS}
            disabled={pending}
          >
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {t(STATUS_KEYS[s])}
              </option>
            ))}
          </select>
        ) : null}

        {operation === "assign_advisor" ? (
          <select
            value={advisorId}
            onChange={(e) => setAdvisorId(e.target.value)}
            className={SELECT_CLASS}
            disabled={pending}
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
        ) : null}

        <Button type="button" onClick={execute} disabled={pending} size="sm">
          {pending
            ? t("submission.toolbar.applying")
            : t("submission.toolbar.apply")}
        </Button>

        {csvHref ? (
          <a
            href={csvHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-[color:var(--aurora-cream)]"
          >
            {t("submission.toolbar.downloadCsv")}
          </a>
        ) : null}

        <Button type="button" onClick={onClear} variant="outline" size="sm">
          {t("submission.toolbar.clearSelection")}
        </Button>
      </div>

      {progress ? (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
            <span>{t("submission.toolbar.progress.label")}</span>
            <span>
              {t("submission.toolbar.progress.count", {
                done: progress.done,
                total: progress.total,
              })}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-zinc-200 dark:bg-[rgba(14,165,233,0.18)]">
            <div
              className="h-full bg-zinc-900 transition-all dark:bg-zinc-50"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-3 space-y-1 text-xs">
          <p>
            {t("submission.toolbar.result", {
              ok: result.succeeded,
              err: result.failed,
              total: result.total,
            })}
          </p>
          {result.failed > 0 ? (
            <details>
              <summary className="cursor-pointer text-zinc-500">
                {t("submission.toolbar.result.detail")}
              </summary>
              <ul className="mt-1 space-y-0.5">
                {result.outcomes
                  .filter((o) => !o.ok)
                  .map((o) => (
                    <li key={o.submission_id} className="font-mono">
                      {o.submission_id.slice(0, 8)}: {o.detail}
                    </li>
                  ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
