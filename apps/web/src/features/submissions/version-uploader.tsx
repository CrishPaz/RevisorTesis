"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  uploadVersionAction,
  type UploadVersionResult,
} from "@/lib/api/submissions";
import { useTranslations } from "@/lib/i18n/locale-provider";

// Per-file cap. Mirrors MAX_VERSION_FILE_BYTES in lib/api/submissions.ts.
// The overall Server Actions bodySizeLimit (next.config.ts) is higher to
// accommodate bulk uploads of multiple files.
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_LABEL = "5 MB";
const ACCEPTED_EXTENSIONS = [".docx", ".pdf"] as const;
const ACCEPTED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
]);

type ClientError =
  | { kind: "unsupported" }
  | { kind: "empty" }
  | { kind: "tooBig"; sizeMb: string }
  | { kind: "selectFile" };

function validateFile(file: File): ClientError | null {
  const nameLower = file.name.toLowerCase();
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
  const mimeOk = file.type === "" ? extOk : ACCEPTED_MIME_TYPES.has(file.type);
  if (!extOk || !mimeOk) {
    return { kind: "unsupported" };
  }
  if (file.size === 0) {
    return { kind: "empty" };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { kind: "tooBig", sizeMb: (file.size / (1024 * 1024)).toFixed(1) };
  }
  return null;
}

export function VersionUploader({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = uploadVersionAction.bind(null, submissionId);
  const [state, formAction, pending] = useActionState<
    UploadVersionResult | null,
    FormData
  >(boundAction, null);
  const [clientError, setClientError] = useState<ClientError | null>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setClientError(null);
      router.refresh();
    }
  }, [state, router]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setClientError(null);
      return;
    }
    const error = validateFile(file);
    if (error) {
      setClientError(error);
      event.target.value = "";
    } else {
      setClientError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const input = event.currentTarget.elements.namedItem(
      "file",
    ) as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      event.preventDefault();
      setClientError({ kind: "selectFile" });
      return;
    }
    const error = validateFile(file);
    if (error) {
      event.preventDefault();
      setClientError(error);
    }
  }

  function clientErrorText(err: ClientError): string {
    switch (err.kind) {
      case "unsupported":
        return t("submission.uploader.errors.unsupported");
      case "empty":
        return t("submission.uploader.errors.empty");
      case "tooBig":
        return t("submission.uploader.errors.tooBig", {
          size: err.sizeMb,
          max: MAX_FILE_LABEL,
        });
      case "selectFile":
        return t("submission.uploader.errors.selectFile");
    }
  }

  const errorMessage = clientError
    ? clientErrorText(clientError)
    : state && !state.ok
      ? state.error
      : null;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="file">{t("submission.uploader.fileLabel")}</Label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
          required
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-50 hover:file:bg-zinc-900/90 dark:file:bg-zinc-50 dark:file:text-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          {t("submission.uploader.maxLabel", { size: MAX_FILE_LABEL })}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">{t("submission.uploader.commentLabel")}</Label>
        <Input
          id="comment"
          name="comment"
          placeholder={t("submission.uploader.commentPlaceholder")}
          maxLength={2000}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Switch
            id="enable_copyleaks"
            name="enable_copyleaks"
            defaultChecked
            value="true"
          />
          <Label htmlFor="enable_copyleaks">
            {t("copyleaks.toggleLabel")}
          </Label>
        </div>
        <p className="text-xs text-zinc-500">
          {t("copyleaks.privacyWarning")}
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {t("submission.uploader.success", {
            n: state.version.version_number,
            status: state.version.parsing_status,
          })}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? t("submission.uploader.submitting")
          : t("submission.uploader.submit")}
      </Button>
    </form>
  );
}
