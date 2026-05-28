import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  type AIFinding,
  type FindingSeverity,
  type FindingType,
  type HumanAction,
} from "@/lib/api/types";
import { getMessages } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n";

function severityVariant(s: FindingSeverity) {
  switch (s) {
    case "critical":
      return "destructive" as const;
    case "major":
      return "warning" as const;
    case "minor":
      return "muted" as const;
    case "suggestion":
      return "outline" as const;
  }
}

const SEVERITY_KEY: Record<FindingSeverity, MessageKey> = {
  critical: "panel.evaluation.severity.critical",
  major: "panel.evaluation.severity.major",
  minor: "panel.evaluation.severity.minor",
  suggestion: "panel.evaluation.severity.suggestion",
};

const FINDING_TYPE_KEY: Record<FindingType, MessageKey> = {
  missing_section: "panel.finding.type.missing_section",
  structural_error: "panel.finding.type.structural_error",
  content_error: "panel.finding.type.content_error",
  form_error: "panel.finding.type.form_error",
  coherence_issue: "panel.finding.type.coherence_issue",
  suggestion: "panel.finding.type.suggestion",
};

const HUMAN_ACTION_KEY: Record<HumanAction, MessageKey> = {
  accepted: "panel.finding.humanAction.accepted",
  modified: "panel.finding.humanAction.modified",
  rejected: "panel.finding.humanAction.rejected",
};

export async function FindingCard({
  finding,
  children,
}: {
  finding: AIFinding;
  children?: ReactNode;
}) {
  const { t } = await getMessages();
  const effectiveSeverity =
    finding.human_severity_override ?? finding.severity;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]">
      <header className="flex flex-wrap items-center gap-2">
        <Badge variant={severityVariant(effectiveSeverity)}>
          {t(SEVERITY_KEY[effectiveSeverity])}
        </Badge>
        <Badge variant="outline">{t(FINDING_TYPE_KEY[finding.type])}</Badge>
        {finding.section ? (
          <span className="text-xs font-medium text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
            {finding.section}
          </span>
        ) : null}
        {finding.human_action ? (
          <Badge
            variant={
              finding.human_action === "accepted"
                ? "success"
                : finding.human_action === "rejected"
                  ? "destructive"
                  : "default"
            }
            className="ml-auto"
          >
            {t(HUMAN_ACTION_KEY[finding.human_action])}
          </Badge>
        ) : null}
      </header>

      <p className="mt-3 text-sm text-zinc-900 dark:text-[color:var(--aurora-cream)]">
        {finding.description}
      </p>

      {finding.instruction ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("panel.finding.howToFix")}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
            {finding.instruction}
          </p>
        </div>
      ) : null}

      {finding.example ? (
        <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm italic text-zinc-700 dark:bg-[rgba(11,31,51,0.55)]/60 dark:text-[color:var(--aurora-cream-dim)]">
          <span className="not-italic text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("panel.finding.example")}
          </span>
          <p className="mt-1">{finding.example}</p>
        </div>
      ) : null}

      {finding.recommendation ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          <span className="font-medium">{t("panel.finding.recommendation")}</span>{" "}
          {finding.recommendation}
        </p>
      ) : null}

      {finding.human_comment ? (
        <div className="mt-3 rounded-md border-l-4 border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-[rgba(11,31,51,0.55)]/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("panel.finding.advisorNote")}
          </p>
          <p className="mt-1 text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
            {finding.human_comment}
          </p>
        </div>
      ) : null}

      {children}
    </article>
  );
}
