import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  SubmissionStatusBadge,
  VersionStatusBadge,
} from "@/features/submissions/status-badge";
import { getMessages } from "@/lib/i18n/server";
import type { SubmissionSummary, VersionParsingStatus } from "@/lib/api/types";

function SimilarityBadge({
  submissionId,
  latestVersionId,
  maxCopyleaksSimilarity,
  status,
  parsingError,
  t,
}: {
  submissionId: string;
  latestVersionId?: string | null;
  maxCopyleaksSimilarity?: number | null;
  status: VersionParsingStatus | null;
  parsingError?: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (!status) return <span className="text-xs text-zinc-400">—</span>;

  if (status === "ai_queued" || status === "ai_processing") {
    return (
      <Badge variant="outline" className="text-xs">
        {t("submission.similarity.processing")}
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge
        variant="destructive"
        className="text-xs"
        title={parsingError ?? undefined}
      >
        {t("submission.similarity.error")}
      </Badge>
    );
  }

  if (maxCopyleaksSimilarity != null && latestVersionId) {
    const pct = (maxCopyleaksSimilarity * 100).toFixed(1);
    const href = `/student/submissions/${submissionId}/versions/${latestVersionId}/viewer`;
    return (
      <Link href={href}>
        <Badge variant="outline" className="text-xs hover:underline">
          {pct}%
        </Badge>
      </Link>
    );
  }

  return <span className="text-xs text-zinc-400">—</span>;
}

export async function SubmissionRow({
  submission,
  basePath,
  showStudent = false,
  latestVersionParsingError,
}: {
  submission: SubmissionSummary;
  basePath: string;
  showStudent?: boolean;
  latestVersionParsingError?: string | null;
}) {
  const { t, locale } = await getMessages();
  const dateLocale = locale === "es" ? "es-PE" : "en-US";
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SubmissionStatusBadge status={submission.status} />
            {submission.latest_version_status ? (
              <VersionStatusBadge status={submission.latest_version_status} />
            ) : (
              <Badge variant="outline">{t("submission.list.noVersions")}</Badge>
            )}
            {submission.latest_version_number ? (
              <Badge variant="muted">v{submission.latest_version_number}</Badge>
            ) : null}
            <Badge variant="outline">[{submission.program.code}]</Badge>
            {submission.advisor_fit_alert ? (
              <Badge
                variant="destructive"
                title={t("submission.list.orcidFitLowTitle")}
              >
                {t("submission.list.orcidFit", {
                  n: ((submission.advisor_fit_score ?? 0) * 100).toFixed(0),
                })}
              </Badge>
            ) : submission.advisor_fit_score !== null ? (
              <Badge
                variant="success"
                title={t("submission.list.orcidFitGoodTitle")}
              >
                {t("submission.list.orcidFit", {
                  n: (submission.advisor_fit_score * 100).toFixed(0),
                })}
              </Badge>
            ) : null}
            <SimilarityBadge
              submissionId={submission.id}
              latestVersionId={submission.latest_version_id}
              maxCopyleaksSimilarity={submission.max_copyleaks_similarity}
              status={submission.latest_version_status}
              parsingError={latestVersionParsingError}
              t={t as (key: string, values?: Record<string, string | number>) => string}
            />
          </div>
          <Link
            href={`${basePath}/${submission.id}`}
            className="mt-2 block truncate text-base font-medium hover:underline"
            title={submission.title}
          >
            {submission.title}
            {submission.chapter ? (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                · {submission.chapter}
              </span>
            ) : null}
          </Link>
          {showStudent ? (
            <p className="truncate text-xs text-zinc-500">
              {submission.student.full_name} · {submission.student.email}
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              {t("submission.list.createdOn", {
                date: new Date(submission.created_at).toLocaleDateString(
                  dateLocale,
                ),
              })}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
