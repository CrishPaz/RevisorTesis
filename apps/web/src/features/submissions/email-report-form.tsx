"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendReportByEmailAction } from "@/lib/api/submissions";
import type { ReportType } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";

const REPORT_TYPES: ReportType[] = ["both", "acta", "plagiarism"];

export function EmailReportForm({
  submissionId,
  defaultTo,
  defaultReportType = "both",
}: {
  submissionId: string;
  defaultTo?: string;
  defaultReportType?: ReportType;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo ?? "");
  const [message, setMessage] = useState("");
  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<
    | { kind: "ok"; to: string; filename: string }
    | { kind: "err"; message: string }
    | null
  >(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    start(async () => {
      const res = await sendReportByEmailAction(
        submissionId,
        to,
        message,
        reportType,
      );
      if (res.ok) {
        setResult({ kind: "ok", to: res.to, filename: res.filename });
        setMessage("");
      } else {
        setResult({ kind: "err", message: res.error });
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {t("submission.email.openButton")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-[color:rgba(125,211,252,0.18)] dark:bg-[rgba(11,31,51,0.55)]"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("submission.email.title")}</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
          className="text-xs text-zinc-500 underline-offset-2 hover:underline"
        >
          {t("submission.email.close")}
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-to">{t("submission.email.toLabel")}</Label>
        <Input
          id="email-to"
          type="email"
          inputMode="email"
          autoComplete="off"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={t("submission.email.toPlaceholder")}
          required
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-report-type">
          {t("submission.email.reportType.label")}
        </Label>
        <select
          id="email-report-type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] dark:focus-visible:ring-sky-500/40"
        >
          {REPORT_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {t(`submission.email.reportType.${rt}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-message">{t("submission.email.messageLabel")}</Label>
        <textarea
          id="email-message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          rows={4}
          placeholder={t("submission.email.messagePlaceholder")}
          disabled={pending}
          className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] dark:focus-visible:ring-sky-500/40"
        />
        <p className="text-xs text-zinc-500">
          {t("submission.email.counter", { n: message.length })}
        </p>
      </div>

      {result?.kind === "err" ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {result.message}
        </p>
      ) : null}
      {result?.kind === "ok" ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {t("submission.email.success", {
            to: result.to,
            filename: result.filename,
          })}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending || !to.trim()}>
          {pending
            ? t("submission.email.submitting")
            : t("submission.email.submit")}
        </Button>
        <p className="text-xs text-zinc-500">{t("submission.email.help")}</p>
      </div>
    </form>
  );
}
