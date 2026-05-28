import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { ComparisonTable } from "@/features/submissions/comparison-table";
import { fetchSubmissions } from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Revisiones · Tesis" };

export default async function AdvisorReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "advisor") redirect(`/${user.role}`);

  const [submissions, { t }] = await Promise.all([
    fetchSubmissions(),
    getMessages(),
  ]);

  // Aggregate KPIs across all assigned submissions.
  const graded = submissions.filter((s) => s.latest_grade != null);
  const avgGrade =
    graded.length > 0
      ? graded.reduce((acc, s) => acc + (s.latest_grade ?? 0), 0) / graded.length
      : null;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const observed = submissions.filter((s) => s.status === "observed").length;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("submission.advisor.badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("submission.advisor.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("submission.advisor.subtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label={t("submission.advisor.kpi.assigned")}
          value={submissions.length}
        />
        <KpiCard
          label={t("submission.advisor.kpi.avgGrade")}
          value={
            avgGrade != null
              ? t("submission.table.gradeOver20", { n: avgGrade.toFixed(2) })
              : "—"
          }
        />
        <KpiCard
          label={t("submission.advisor.kpi.observed")}
          value={observed}
          tone={observed > 0 ? "warning" : "default"}
        />
        <KpiCard
          label={t("submission.advisor.kpi.approved")}
          value={approved}
          tone={approved > 0 ? "success" : "default"}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("submission.advisor.comparison.title", {
              n: submissions.length,
            })}
          </CardTitle>
          <CardDescription>
            {t("submission.advisor.comparison.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComparisonTable
            submissions={submissions}
            basePath="/advisor/reviews"
          />
        </CardContent>
      </Card>
    </div>
  );
}
