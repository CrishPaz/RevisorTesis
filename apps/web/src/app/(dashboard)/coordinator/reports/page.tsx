import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { fetchPrograms } from "@/lib/api/programs";
import {
  fetchProgramsRollup,
  fetchSubmissionsReport,
} from "@/lib/api/reports";
import { fetchStatsOverview } from "@/lib/api/stats";
import { getCurrentUser } from "@/lib/auth/session";
import { type SubmissionStatus } from "@/lib/api/types";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Reportes · Tesis" };

const STATUSES: SubmissionStatus[] = [
  "draft",
  "in_progress",
  "observed",
  "approved",
  "rejected",
];

// Use placeholder dash for grade/percent.
function formatGrade(v: number | null, dash: string) {
  return v === null ? dash : v.toFixed(2);
}
function formatPct(v: number | null, dash: string) {
  return v === null ? dash : `${v.toFixed(1)}%`;
}

type SearchParams = Promise<{
  program_id?: string;
  status?: string;
}>;

export default async function CoordinatorReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "coordinator" && user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  const { t } = await getMessages();
  const dash = t("panel.common.dash");

  const params = await searchParams;
  const programFilter = params.program_id ?? "";
  const statusFilter = params.status ?? "";

  const [overview, rollup, report, programs] = await Promise.all([
    fetchStatsOverview(),
    fetchProgramsRollup(),
    fetchSubmissionsReport({
      program_id: programFilter || undefined,
      status: statusFilter || undefined,
    }),
    fetchPrograms(),
  ]);

  const exportQs = new URLSearchParams();
  if (programFilter) exportQs.set("program_id", programFilter);
  if (statusFilter) exportQs.set("status", statusFilter);
  const exportSuffix = exportQs.toString() ? `?${exportQs.toString()}` : "";
  const submissionsCsvHref = `/api/reports/submissions.csv${exportSuffix}`;
  const submissionsPdfHref = `/api/reports/submissions.pdf${exportSuffix}`;

  const flagged = report.rows.filter(
    (r) =>
      r.advisor_fit_alert ||
      (r.total_percentage !== null && r.total_percentage < 60),
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {t("panel.common.coordinator")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("panel.coordinator.reports.title")}
          </h1>
          <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
            {t("panel.coordinator.reports.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a
              href="/api/reports/executive.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("panel.coordinator.reports.executive")}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="/api/reports/activity.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("panel.coordinator.reports.activity")}
            </a>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label={t("panel.coordinator.reports.kpi.submissions")}
          value={overview.total_submissions}
        />
        <KpiCard
          label={t("panel.coordinator.reports.kpi.avgGrade")}
          value={formatGrade(overview.avg_ai_grade, dash)}
          helper={t("panel.coordinator.reports.kpi.avgGradeHelper", {
            value: formatPct(overview.avg_ai_percentage, dash),
          })}
        />
        <KpiCard
          label={t("panel.coordinator.reports.kpi.lowCompliance")}
          value={overview.low_compliance_submissions}
          tone={overview.low_compliance_submissions > 0 ? "warning" : "default"}
          helper={t("panel.coordinator.reports.kpi.lowComplianceHelper")}
        />
        <KpiCard
          label={t("panel.coordinator.reports.kpi.criticalAlerts")}
          value={overview.plagiarism_alerts + overview.advisor_fit_alerts}
          tone={
            overview.plagiarism_alerts + overview.advisor_fit_alerts > 0
              ? "danger"
              : "default"
          }
          helper={t("panel.coordinator.reports.kpi.criticalAlertsHelper")}
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>{t("panel.coordinator.reports.rollup.title")}</CardTitle>
            <CardDescription>
              {t("panel.coordinator.reports.rollup.description")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/api/reports/programs.csv">{t("panel.common.csv")}</a>
            </Button>
            <Button asChild size="sm">
              <a
                href="/api/reports/programs.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("panel.common.pdf")}
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rollup.rows.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {t("panel.coordinator.reports.rollup.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-widest text-zinc-500 dark:border-[color:rgba(125,211,252,0.12)] dark:text-[color:var(--aurora-cream-dim)]">
                    <th className="py-2 pr-4">
                      {t("panel.coordinator.reports.rollup.code")}
                    </th>
                    <th className="py-2 pr-4">
                      {t("panel.coordinator.reports.rollup.program")}
                    </th>
                    <th className="py-2 pr-4 text-right">
                      {t("panel.coordinator.reports.rollup.submissions")}
                    </th>
                    <th className="py-2 pr-4 text-right">
                      {t("panel.coordinator.reports.rollup.aiGrade")}
                    </th>
                    <th className="py-2 pr-4 text-right">
                      {t("panel.coordinator.reports.rollup.plagiarism")}
                    </th>
                    <th className="py-2 text-right">
                      {t("panel.coordinator.reports.rollup.orcidFit")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rollup.rows.map((r) => (
                    <tr
                      key={r.program_id}
                      className="border-b border-zinc-100 last:border-0 dark:border-[color:rgba(125,211,252,0.08)]"
                    >
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{r.program_code}</Badge>
                      </td>
                      <td className="py-2 pr-4">{r.program_name}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {r.submissions_count}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {formatGrade(r.average_grade, dash)}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {r.plagiarism_alerts > 0 ? (
                          <Badge variant="destructive">
                            {r.plagiarism_alerts}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400">0</span>
                        )}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {r.fit_alerts > 0 ? (
                          <Badge variant="warning">{r.fit_alerts}</Badge>
                        ) : (
                          <span className="text-zinc-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>
              {t("panel.coordinator.reports.list.title", {
                count: report.total,
              })}
            </CardTitle>
            <CardDescription>
              {t("panel.coordinator.reports.list.description")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={submissionsCsvHref}>{t("panel.common.csv")}</a>
            </Button>
            <Button asChild size="sm">
              <a
                href={submissionsPdfHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("panel.common.pdf")}
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="GET" className="flex flex-wrap gap-2 text-sm">
            <select
              name="program_id"
              defaultValue={programFilter}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]"
            >
              <option value="">
                {t("panel.coordinator.reports.filter.allPrograms")}
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]"
            >
              <option value="">
                {t("panel.coordinator.reports.filter.allStatuses")}
              </option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              {t("panel.common.filter")}
            </Button>
            {programFilter || statusFilter ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/coordinator/reports">
                  {t("panel.common.clear")}
                </Link>
              </Button>
            ) : null}
          </form>

          {report.rows.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {t("panel.coordinator.reports.list.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-widest text-zinc-500 dark:border-[color:rgba(125,211,252,0.12)] dark:text-[color:var(--aurora-cream-dim)]">
                    <th className="py-2 pr-3">
                      {t("panel.coordinator.reports.table.program")}
                    </th>
                    <th className="py-2 pr-3">
                      {t("panel.coordinator.reports.table.title")}
                    </th>
                    <th className="py-2 pr-3">
                      {t("panel.coordinator.reports.table.student")}
                    </th>
                    <th className="py-2 pr-3">
                      {t("panel.coordinator.reports.table.advisor")}
                    </th>
                    <th className="py-2 pr-3">
                      {t("panel.coordinator.reports.table.status")}
                    </th>
                    <th className="py-2 pr-3 text-right">
                      {t("panel.coordinator.reports.table.aiGrade")}
                    </th>
                    <th className="py-2 text-right">
                      {t("panel.coordinator.reports.table.alerts")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr
                      key={r.submission_id}
                      className="border-b border-zinc-100 last:border-0 dark:border-[color:rgba(125,211,252,0.08)]"
                    >
                      <td className="py-2 pr-3">
                        <Badge variant="outline">{r.program_code}</Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <p className="font-medium" title={r.title}>
                          {r.title}
                        </p>
                        {r.chapter ? (
                          <p className="text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
                            {r.chapter}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-xs">{r.student_name}</td>
                      <td className="py-2 pr-3 text-xs">
                        {r.advisor_name ?? dash}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="muted">{r.status}</Badge>
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {r.decimal_grade !== null
                          ? r.decimal_grade.toFixed(2)
                          : dash}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {r.advisor_fit_alert ? (
                            <Badge variant="warning">
                              {t("panel.coordinator.reports.alert.orcid")}
                            </Badge>
                          ) : null}
                          {r.total_percentage !== null &&
                          r.total_percentage < 60 ? (
                            <Badge variant="destructive">
                              {t("panel.coordinator.reports.alert.low")}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {flagged.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("panel.coordinator.reports.attention.title", {
                count: flagged.length,
              })}
            </CardTitle>
            <CardDescription>
              {t("panel.coordinator.reports.attention.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {flagged.map((r) => (
                <li
                  key={r.submission_id}
                  className="flex flex-col gap-1 rounded-md border border-zinc-200 p-3 dark:border-[color:rgba(125,211,252,0.12)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
                      {r.student_name} · {r.program_code}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.advisor_fit_alert ? (
                      <Badge variant="warning">
                        {t("panel.coordinator.reports.attention.orcidFit")}
                      </Badge>
                    ) : null}
                    {r.total_percentage !== null &&
                    r.total_percentage < 60 ? (
                      <Badge variant="destructive">
                        {t("panel.coordinator.reports.attention.ai", {
                          value: r.total_percentage.toFixed(0),
                        })}
                      </Badge>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
