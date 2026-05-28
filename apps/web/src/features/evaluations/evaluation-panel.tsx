import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EvaluationSummary } from "@/features/evaluations/evaluation-summary";
import { FindingCard } from "@/features/evaluations/finding-card";
import {
  type AIEvaluation,
  type AIFinding,
  type FindingSeverity,
} from "@/lib/api/types";
import { getMessages } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n";

const SEVERITY_ORDER: FindingSeverity[] = [
  "critical",
  "major",
  "minor",
  "suggestion",
];

const SEVERITY_KEY: Record<FindingSeverity, MessageKey> = {
  critical: "panel.evaluation.severity.critical",
  major: "panel.evaluation.severity.major",
  minor: "panel.evaluation.severity.minor",
  suggestion: "panel.evaluation.severity.suggestion",
};

export async function EvaluationPanel({
  evaluation,
  emptyMessage,
  renderFindingExtra,
}: {
  evaluation: AIEvaluation | null;
  emptyMessage: string;
  renderFindingExtra?: (f: AIFinding) => ReactNode;
}) {
  const { t } = await getMessages();

  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("panel.evaluation.empty.title")}</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groups = new Map<FindingSeverity, AIFinding[]>();
  for (const sev of SEVERITY_ORDER) groups.set(sev, []);
  for (const f of evaluation.findings) {
    const effective = f.human_severity_override ?? f.severity;
    groups.get(effective)?.push(f);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("panel.evaluation.summary.title")}</CardTitle>
          <CardDescription>
            {t("panel.evaluation.summary.description", {
              count: evaluation.findings.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationSummary evaluation={evaluation} />
        </CardContent>
      </Card>

      {SEVERITY_ORDER.map((sev) => {
        const items = groups.get(sev) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={sev} className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Badge
                variant={
                  sev === "critical"
                    ? "destructive"
                    : sev === "major"
                      ? "warning"
                      : sev === "minor"
                        ? "muted"
                        : "outline"
                }
              >
                {t(SEVERITY_KEY[sev])}
              </Badge>
              <span className="text-zinc-500">
                {items.length === 1
                  ? t("panel.evaluation.findingsOne", { count: items.length })
                  : t("panel.evaluation.findingsMany", { count: items.length })}
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((f) => (
                <FindingCard key={f.id} finding={f}>
                  {renderFindingExtra ? renderFindingExtra(f) : null}
                </FindingCard>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
