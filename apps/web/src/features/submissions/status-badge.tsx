"use client";

import { Badge } from "@/components/ui/badge";
import {
  type SubmissionStatus,
  type VersionParsingStatus,
} from "@/lib/api/types";
import { useTranslations } from "@/lib/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n";

// Local mapping: status enum (from the API) → translation key.
// We don't mutate SUBMISSION_STATUS_LABELS / VERSION_STATUS_LABELS because
// other blocks may still rely on them as plain Spanish constants.
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

function submissionVariant(status: SubmissionStatus) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "rejected":
      return "destructive" as const;
    case "observed":
      return "warning" as const;
    case "in_progress":
      return "default" as const;
    case "draft":
      return "muted" as const;
  }
}

function versionVariant(status: VersionParsingStatus) {
  switch (status) {
    case "ai_completed":
    case "parsed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "ai_processing":
    case "ai_queued":
    case "processing":
    case "pending":
      return "warning" as const;
  }
}

export function SubmissionStatusBadge({
  status,
}: {
  status: SubmissionStatus;
}) {
  const t = useTranslations();
  return (
    <Badge variant={submissionVariant(status)}>
      {t(SUBMISSION_STATUS_KEYS[status])}
    </Badge>
  );
}

export function VersionStatusBadge({
  status,
}: {
  status: VersionParsingStatus;
}) {
  const t = useTranslations();
  return (
    <Badge variant={versionVariant(status)}>
      {t(VERSION_STATUS_KEYS[status])}
    </Badge>
  );
}
