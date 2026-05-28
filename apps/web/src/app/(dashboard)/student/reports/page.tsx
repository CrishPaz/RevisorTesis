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
import { SubmissionStatusBadge } from "@/features/submissions/status-badge";
import { fetchSubmissions } from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
import { type SubmissionStatus } from "@/lib/api/types";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Mis reportes · Tesis" };

export default async function StudentReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const { t } = await getMessages();

  const submissions = await fetchSubmissions();

  const counts: Record<SubmissionStatus, number> = {
    draft: 0,
    in_progress: 0,
    observed: 0,
    approved: 0,
    rejected: 0,
  };
  for (const s of submissions) {
    counts[s.status as SubmissionStatus] += 1;
  }

  const downloadable = submissions.filter(
    (s) => s.latest_version_number !== null,
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.student")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.student.reports.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.student.reports.subtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label={t("panel.student.reports.kpi.submissions")}
          value={submissions.length}
        />
        <KpiCard
          label={t("panel.student.reports.kpi.inProgress")}
          value={counts.in_progress}
        />
        <KpiCard
          label={t("panel.student.reports.kpi.observed")}
          value={counts.observed}
          tone={counts.observed > 0 ? "warning" : "default"}
        />
        <KpiCard
          label={t("panel.student.reports.kpi.approved")}
          value={counts.approved}
          tone={counts.approved > 0 ? "success" : "default"}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.student.reports.list.title", {
              count: downloadable.length,
            })}
          </CardTitle>
          <CardDescription>
            {t("panel.student.reports.list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="space-y-3 text-sm text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              <p>{t("panel.student.reports.empty")}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/submissions/new">
                  {t("panel.student.reports.createFirst")}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {submissions.map((s) => {
                const ready = s.latest_version_number !== null;
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <SubmissionStatusBadge status={s.status} />
                        <Badge variant="outline">[{s.program.code}]</Badge>
                        {s.latest_version_number ? (
                          <Badge variant="muted">
                            v{s.latest_version_number}
                          </Badge>
                        ) : null}
                      </div>
                      <p
                        className="mt-1 truncate font-medium"
                        title={s.title}
                      >
                        {s.title}
                      </p>
                      {s.chapter ? (
                        <p className="truncate text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
                          {s.chapter}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/student/submissions/${s.id}`}>
                          {t("panel.student.reports.viewDetail")}
                        </Link>
                      </Button>
                      {ready ? (
                        <Button asChild size="sm">
                          <a
                            href={`/api/submissions/${s.id}/report.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("panel.student.reports.downloadActa")}
                          </a>
                        </Button>
                      ) : (
                        <Badge
                          variant="muted"
                          title={t("panel.student.reports.noVersionTitle")}
                        >
                          {t("panel.student.reports.noVersion")}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.student.reports.includes.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            <li>{t("panel.student.reports.includes.item1")}</li>
            <li>{t("panel.student.reports.includes.item2")}</li>
            <li>{t("panel.student.reports.includes.item3")}</li>
            <li>{t("panel.student.reports.includes.item4")}</li>
            <li>{t("panel.student.reports.includes.item5")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
