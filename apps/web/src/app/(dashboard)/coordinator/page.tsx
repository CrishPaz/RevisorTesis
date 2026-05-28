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
import { ProgramBars } from "@/features/dashboard/program-bars";
import { StatusDonut } from "@/features/dashboard/status-donut";
import { fetchStatsActivity, fetchStatsOverview } from "@/lib/api/stats";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Dashboard · Tesis" };

function formatPct(v: number | null) {
  return v === null ? "—" : `${v.toFixed(1)}%`;
}
function formatGrade(v: number | null) {
  return v === null ? "—" : v.toFixed(2);
}

export default async function CoordinatorDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "coordinator" && user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  const { t, locale } = await getMessages();
  const [stats, activity] = await Promise.all([
    fetchStatsOverview(),
    fetchStatsActivity(15),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {t("dashboard.coordinator.role")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("dashboard.coordinator.title")}
          </h1>
          <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
            {t("dashboard.coordinator.subtitle")}
          </p>
        </div>
        <Button asChild size="lg">
          <a
            href="/api/reports/executive.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("dashboard.coordinator.executiveReport")}
          </a>
        </Button>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={t("kpi.totalSubmissions")}
          value={stats.total_submissions}
        />
        <KpiCard
          label={t("kpi.avgGrade")}
          value={formatGrade(stats.avg_ai_grade)}
          helper={t("dashboard.coordinator.kpiAvgGradeHelper", {
            pct: formatPct(stats.avg_ai_percentage),
          })}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiConcordance")}
          value={formatPct(stats.ai_human_concordance_pct)}
          helper={t("dashboard.coordinator.kpiConcordanceHelper")}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiAdvisorsOrcid")}
          value={stats.total_advisors_with_orcid}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiPlagiarism")}
          value={stats.plagiarism_alerts}
          tone={stats.plagiarism_alerts > 0 ? "danger" : "default"}
          helper={t("dashboard.coordinator.kpiPlagiarismHelper")}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiFitAlerts")}
          value={stats.advisor_fit_alerts}
          tone={stats.advisor_fit_alerts > 0 ? "warning" : "default"}
          helper={t("dashboard.coordinator.kpiFitAlertsHelper")}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiLowCompliance")}
          value={stats.low_compliance_submissions}
          tone={stats.low_compliance_submissions > 0 ? "warning" : "default"}
          helper={t("dashboard.coordinator.kpiLowComplianceHelper")}
        />
        <KpiCard
          label={t("dashboard.coordinator.kpiCitationsProblematic")}
          value={stats.citations_problematic}
          helper={t("dashboard.coordinator.kpiCitationsProblematicHelper", {
            total: stats.citations_total,
          })}
          tone={stats.citations_problematic > 0 ? "warning" : "default"}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("dashboard.coordinator.statusDistributionTitle")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.coordinator.statusDistributionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut data={stats.submissions_by_status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t("dashboard.coordinator.programGradesTitle")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.coordinator.programGradesDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramBars data={stats.grades_per_program} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.coordinator.recentActivityTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.coordinator.recentActivityDescription", {
              count: activity.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("dashboard.coordinator.recentActivityEmpty")}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activity.map((a, idx) => (
                <li
                  key={`${a.submission_id}-${a.occurred_at}-${idx}`}
                  className="flex items-start justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-[color:var(--aurora-cream)]">
                      {a.description}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {a.submission_title} · {a.actor_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {a.kind.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {new Date(a.occurred_at).toLocaleString(
                        locale === "en" ? "en-US" : "es-PE",
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
