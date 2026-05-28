"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBulkSubmissionsAction,
  type BulkCreateResult,
} from "@/lib/api/submissions";
import { PROGRAM_LEVEL_LABELS, type Program } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;
const ACCEPTED_EXT = [".docx", ".pdf"] as const;
const ACCEPTED_MIME = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
]);

type RowErrorCode = "unsupported" | "empty" | "tooBig";

type Row = {
  // We keep the original File reference + editable metadata.
  file: File;
  title: string;
  chapter: string;
  errorCode: RowErrorCode | null;
  errorSize: string | null;
};

function fileError(file: File): { code: RowErrorCode; size: string | null } | null {
  const nameLower = file.name.toLowerCase();
  const extOk = ACCEPTED_EXT.some((e) => nameLower.endsWith(e));
  const mimeOk = file.type === "" ? extOk : ACCEPTED_MIME.has(file.type);
  if (!extOk || !mimeOk) return { code: "unsupported", size: null };
  if (file.size === 0) return { code: "empty", size: null };
  if (file.size > MAX_FILE_BYTES) {
    return { code: "tooBig", size: (file.size / (1024 * 1024)).toFixed(1) };
  }
  return null;
}

function stripExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function BulkSubmissionForm({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [state, formAction, pending] = useActionState<
    BulkCreateResult | null,
    FormData
  >(createBulkSubmissionsAction, null);

  useEffect(() => {
    if (state?.ok) {
      setRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push("/student/submissions");
    }
  }, [state, router]);

  if (programs.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        {t("submission.bulk.noPrograms")}
      </p>
    );
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const next: Row[] = [];
    for (const f of picked) {
      const err = fileError(f);
      next.push({
        file: f,
        title: stripExt(f.name).slice(0, 255),
        chapter: "",
        errorCode: err?.code ?? null,
        errorSize: err?.size ?? null,
      });
    }
    // Append (so they can pick in batches), but cap at MAX_FILES.
    setRows((prev) => [...prev, ...next].slice(0, MAX_FILES));
    // Reset the input so the user can re-pick the same file if needed.
    e.target.value = "";
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (rows.length === 0) {
      e.preventDefault();
      return;
    }
    if (rows.some((r) => r.errorCode)) {
      e.preventDefault();
      return;
    }
    if (rows.some((r) => !r.title.trim())) {
      e.preventDefault();
      return;
    }
    const dt = new DataTransfer();
    for (const r of rows) dt.items.add(r.file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function rowErrorText(r: Row): string | null {
    if (!r.errorCode) return null;
    const keyMap: Record<RowErrorCode, MessageKey> = {
      unsupported: "submission.bulk.errors.unsupported",
      empty: "submission.bulk.errors.empty",
      tooBig: "submission.bulk.errors.tooBig",
    };
    const key = keyMap[r.errorCode];
    if (r.errorCode === "tooBig" && r.errorSize) {
      return t(key, { size: r.errorSize });
    }
    return t(key);
  }

  const totalBytes = rows.reduce((acc, r) => acc + r.file.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
  const hasErrors = rows.some((r) => r.errorCode);
  const blocked = pending || rows.length === 0 || hasErrors;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="program_id">{t("submission.bulk.programLabel")}</Label>
        <select
          id="program_id"
          name="program_id"
          required
          defaultValue={programs[0]?.id}
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] dark:focus-visible:ring-sky-500/40"
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.code}] {p.name} — {PROGRAM_LEVEL_LABELS[p.level]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="files-picker">
          {t("submission.bulk.filesLabel", { max: MAX_FILES })}
        </Label>
        <input
          id="files-picker"
          ref={fileInputRef}
          name="files"
          type="file"
          multiple
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
          onChange={handlePick}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-50 hover:file:bg-zinc-900/90 dark:file:bg-zinc-50 dark:file:text-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          {t("submission.bulk.filesHelp", { max: MAX_FILES })}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {rows.length === 1
                ? t("submission.bulk.rowsReadyOne", {
                    n: rows.length,
                    size: totalMb,
                  })
                : t("submission.bulk.rowsReady", {
                    n: rows.length,
                    size: totalMb,
                  })}
            </p>
            <button
              type="button"
              onClick={() => setRows([])}
              className="text-xs text-zinc-500 underline-offset-2 hover:underline"
            >
              {t("submission.bulk.clearAll")}
            </button>
          </div>

          <ul className="space-y-3">
            {rows.map((r, i) => (
              <li
                key={`${r.file.name}-${i}`}
                className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-[color:rgba(125,211,252,0.18)] dark:bg-[rgba(11,31,51,0.55)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-xs font-mono text-zinc-500"
                    title={r.file.name}
                  >
                    {r.file.name} · {(r.file.size / 1024).toFixed(0)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    {t("submission.bulk.remove")}
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr]">
                  <div className="space-y-1">
                    <Label htmlFor={`title-${i}`} className="text-xs">
                      {t("submission.bulk.rowTitleLabel")}
                    </Label>
                    <Input
                      id={`title-${i}`}
                      name="titles"
                      value={r.title}
                      onChange={(e) =>
                        updateRow(i, { title: e.target.value.slice(0, 255) })
                      }
                      placeholder={t("submission.bulk.titlePlaceholder")}
                      required
                      minLength={2}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`chapter-${i}`} className="text-xs">
                      {t("submission.bulk.rowChapterLabel")}
                    </Label>
                    <Input
                      id={`chapter-${i}`}
                      name="chapters"
                      value={r.chapter}
                      onChange={(e) =>
                        updateRow(i, { chapter: e.target.value.slice(0, 100) })
                      }
                      placeholder={t("submission.bulk.chapterPlaceholder")}
                      maxLength={100}
                    />
                  </div>
                </div>

                {r.errorCode ? (
                  <p className="mt-2 text-xs text-rose-600">{rowErrorText(r)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state && !state.ok ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {state.submissions.length === 1
            ? t("submission.bulk.successOne", { n: state.submissions.length })
            : t("submission.bulk.success", { n: state.submissions.length })}
        </p>
      ) : null}

      <Button type="submit" disabled={blocked}>
        {pending
          ? rows.length === 1
            ? t("submission.bulk.submittingOne", { n: rows.length })
            : t("submission.bulk.submitting", { n: rows.length })
          : rows.length > 0
            ? rows.length === 1
              ? t("submission.bulk.submitOne", { n: rows.length })
              : t("submission.bulk.submit", { n: rows.length })
            : t("submission.bulk.selectFirst")}
      </Button>
    </form>
  );
}
