import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { VersionStatusBadge } from "@/features/submissions/status-badge";
import { getMessages } from "@/lib/i18n/server";
import type { SubmissionVersionSummary } from "@/lib/api/types";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function VersionList({
  versions,
  downloadBase,
  viewerBase,
}: {
  versions: SubmissionVersionSummary[];
  downloadBase: string;
  viewerBase?: string;
}) {
  const { t, locale } = await getMessages();
  const dateLocale = locale === "es" ? "es-PE" : "en-US";

  if (versions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {t("submission.versionList.empty")}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {versions.map((v) => (
        <li
          key={v.id}
          className="rounded-md border border-zinc-200 p-3 dark:border-[color:rgba(125,211,252,0.12)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="muted">v{v.version_number}</Badge>
                <VersionStatusBadge status={v.parsing_status} />
              </div>
              <p
                className="mt-1 truncate text-sm font-medium"
                title={v.original_filename}
              >
                {v.original_filename}
              </p>
              <p className="text-xs text-zinc-500">
                {formatSize(v.file_size_bytes)}
                {v.page_count > 0
                  ? ` · ${t("submission.versionList.pages", { n: v.page_count })}`
                  : ""}
                {" · "}
                {new Date(v.created_at).toLocaleString(dateLocale)}
              </p>
              {v.comment ? (
                <p className="mt-2 text-sm text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
                  {v.comment}
                </p>
              ) : null}
              {v.parsing_error ? (
                <p className="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {v.parsing_error}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <a
                href={`${downloadBase}/${v.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-[color:var(--aurora-cream)]"
              >
                {t("submission.versionList.download")}
              </a>
              {viewerBase && v.parsing_status === "ai_completed" ? (
                <Link
                  href={`${viewerBase}/${v.id}/viewer`}
                  className="text-sm font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
                >
                  {t("submission.versionList.viewSimilarity")}
                </Link>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
