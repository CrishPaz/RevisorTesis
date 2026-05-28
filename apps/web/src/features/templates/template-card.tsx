"use client";

import Link from "next/link";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activateTemplateAction,
  deleteTemplateAction,
} from "@/lib/api/templates";
import { type TemplateSummary } from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n";

function statusVariant(status: TemplateSummary["parsing_status"]) {
  switch (status) {
    case "parsed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "processing":
    case "pending":
      return "warning" as const;
  }
}

const STATUS_KEY: Record<TemplateSummary["parsing_status"], MessageKey> = {
  pending: "panel.templates.status.pending",
  processing: "panel.templates.status.processing",
  parsed: "panel.templates.status.parsed",
  failed: "panel.templates.status.failed",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TemplateCard({ template }: { template: TemplateSummary }) {
  const t = useTranslations();
  const [pending, start] = useTransition();

  function onActivate() {
    start(async () => {
      await activateTemplateAction(template.id);
    });
  }

  function onDelete() {
    if (
      !confirm(t("panel.templates.confirmDelete", { title: template.title }))
    )
      return;
    start(async () => {
      await deleteTemplateAction(template.id);
    });
  }

  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(template.parsing_status)}>
              {t(STATUS_KEY[template.parsing_status])}
            </Badge>
            {template.is_active ? (
              <Badge variant="default">{t("panel.templates.active")}</Badge>
            ) : (
              <Badge variant="outline">{t("panel.templates.inactive")}</Badge>
            )}
            <Badge variant="muted">v{template.version}</Badge>
          </div>
          <Link
            href={`/coordinator/templates/${template.id}`}
            className="mt-2 block truncate text-base font-medium hover:underline"
            title={template.title}
          >
            {template.title}
          </Link>
          <p className="truncate text-xs text-zinc-500" title={template.original_filename}>
            {template.original_filename} · {formatSize(template.file_size_bytes)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!template.is_active && template.parsing_status === "parsed" ? (
            <Button
              type="button"
              size="sm"
              onClick={onActivate}
              disabled={pending}
            >
              {t("panel.templates.activate")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={pending}
          >
            {t("panel.templates.delete")}
          </Button>
        </div>
      </div>
      {template.parsing_error ? (
        <p className="mt-3 rounded border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {template.parsing_error}
        </p>
      ) : null}
    </li>
  );
}
