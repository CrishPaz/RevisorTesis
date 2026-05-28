"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSubmissionAction,
  type CreateSubmissionResult,
} from "@/lib/api/submissions";
import { PROGRAM_LEVEL_LABELS, type Program } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";

export function SubmissionForm({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    CreateSubmissionResult | null,
    FormData
  >(createSubmissionAction, null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.push(`/student/submissions/${state.submission.id}`);
    }
  }, [state, router]);

  if (programs.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        {t("submission.form.noPrograms")}
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="program_id">{t("submission.form.programLabel")}</Label>
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
        <Label htmlFor="title">{t("submission.form.titleLabel")}</Label>
        <Input
          id="title"
          name="title"
          placeholder={t("submission.form.titlePlaceholder")}
          minLength={2}
          maxLength={255}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chapter">{t("submission.form.chapterLabel")}</Label>
        <Input
          id="chapter"
          name="chapter"
          placeholder={t("submission.form.chapterPlaceholder")}
          maxLength={100}
        />
      </div>

      {state && !state.ok ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? t("submission.form.creating") : t("submission.form.submit")}
      </Button>
    </form>
  );
}
