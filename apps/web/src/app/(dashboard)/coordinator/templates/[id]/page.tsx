import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StructureTree } from "@/features/templates/structure-tree";
import { ApiError } from "@/lib/api/client";
import { fetchTemplate } from "@/lib/api/templates";
import type {
  ProgramLevel,
  TemplateParsingStatus,
} from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n";

export const metadata = { title: "Plantilla · Tesis" };

const PROGRAM_LEVEL_KEY: Record<ProgramLevel, MessageKey> = {
  undergraduate: "panel.programs.level.undergraduate",
  masters: "panel.programs.level.masters",
  doctorate: "panel.programs.level.doctorate",
};

const TEMPLATE_STATUS_KEY: Record<TemplateParsingStatus, MessageKey> = {
  pending: "panel.templates.status.pending",
  processing: "panel.templates.status.processing",
  parsed: "panel.templates.status.parsed",
  failed: "panel.templates.status.failed",
};

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "coordinator" && user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  const { t, locale } = await getMessages();
  const dateLocale = locale === "en" ? "en-US" : "es-PE";

  const { id } = await params;
  let template;
  try {
    template = await fetchTemplate(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/coordinator/templates"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-[color:var(--aurora-cream)]"
        >
          {t("panel.coordinator.templateDetail.back")}
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              template.parsing_status === "parsed"
                ? "success"
                : template.parsing_status === "failed"
                  ? "destructive"
                  : "warning"
            }
          >
            {t(TEMPLATE_STATUS_KEY[template.parsing_status])}
          </Badge>
          {template.is_active ? (
            <Badge>{t("panel.coordinator.templateDetail.active")}</Badge>
          ) : (
            <Badge variant="outline">
              {t("panel.coordinator.templateDetail.inactive")}
            </Badge>
          )}
          <Badge variant="muted">v{template.version}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {template.title}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {template.description ??
            t("panel.coordinator.templateDetail.noDescription")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.coordinator.templateDetail.program.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="font-mono text-xs text-zinc-500">
              [{template.program.code}]
            </span>{" "}
            {template.program.name} ·{" "}
            <span className="text-zinc-500">
              {t(PROGRAM_LEVEL_KEY[template.program.level])}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.coordinator.templateDetail.file.title")}
          </CardTitle>
          <CardDescription>
            {t("panel.coordinator.templateDetail.file.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-zinc-500">
              {t("panel.coordinator.templateDetail.file.name")}
            </dt>
            <dd className="font-mono break-all">
              {template.original_filename}
            </dd>
            <dt className="text-zinc-500">
              {t("panel.coordinator.templateDetail.file.mime")}
            </dt>
            <dd className="font-mono">{template.mime_type}</dd>
            <dt className="text-zinc-500">
              {t("panel.coordinator.templateDetail.file.size")}
            </dt>
            <dd>
              {(template.file_size_bytes / 1024).toFixed(1)} KB
            </dd>
            <dt className="text-zinc-500">
              {t("panel.coordinator.templateDetail.file.uploaded")}
            </dt>
            <dd>{new Date(template.created_at).toLocaleString(dateLocale)}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.coordinator.templateDetail.structure.title")}
          </CardTitle>
          <CardDescription>
            {t("panel.coordinator.templateDetail.structure.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.parsing_status === "failed" ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {template.parsing_error ??
                t("panel.coordinator.templateDetail.structure.parsingError")}
            </p>
          ) : template.structure_json ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                {t(
                  "panel.coordinator.templateDetail.structure.summaryBase",
                  {
                    sections: template.structure_json.sections.length,
                    paragraphs: template.structure_json.total_paragraphs,
                    chars: template.structure_json.total_chars,
                  },
                )}
                {template.structure_json.page_count > 0
                  ? t(
                      "panel.coordinator.templateDetail.structure.summaryPages",
                      { pages: template.structure_json.page_count },
                    )
                  : ""}
              </p>
              <StructureTree sections={template.structure_json.sections} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              {t("panel.coordinator.templateDetail.structure.processing")}
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link href="/coordinator/templates">{t("panel.common.back")}</Link>
        </Button>
      </div>
    </div>
  );
}
