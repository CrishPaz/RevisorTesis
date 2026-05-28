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
import { SubmissionRow } from "@/features/submissions/submission-row";
import { fetchSubmissions } from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_LABEL_KEYS } from "@/lib/auth/types";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Estudiante · Tesis" };

export default async function StudentHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const { t } = await getMessages();
  const submissions = await fetchSubmissions();

  const counts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const inProgress = counts.in_progress ?? 0;
  const observed = counts.observed ?? 0;
  const approved = counts.approved ?? 0;

  const recent = submissions.slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t(ROLE_LABEL_KEYS.student)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("home.greeting", { name: user.full_name.split(" ")[0] })}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("home.subtitle.student")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label={t("kpi.totalSubmissions")} value={submissions.length} />
        <KpiCard label={t("kpi.inProgress")} value={inProgress} />
        <KpiCard
          label={t("kpi.observed")}
          value={observed}
          tone={observed > 0 ? "warning" : "default"}
        />
        <KpiCard
          label={t("kpi.approved")}
          value={approved}
          tone={approved > 0 ? "success" : "default"}
        />
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>{t("dashboard.student.recentTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.student.recentDescription")}
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/student/submissions/new">
              {t("dashboard.common.newSubmission")}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("dashboard.student.empty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  basePath="/student/submissions"
                />
              ))}
            </ul>
          )}
          {submissions.length > recent.length ? (
            <p className="mt-3 text-xs text-zinc-500">
              <Link href="/student/submissions" className="underline">
                {t("dashboard.common.viewAll", { count: submissions.length })}
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.student.howTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li>
              <Badge variant="muted">1</Badge>{" "}
              {t("dashboard.student.howStep1")}
            </li>
            <li>
              <Badge variant="muted">2</Badge>{" "}
              {t("dashboard.student.howStep2")}
            </li>
            <li>
              <Badge variant="muted">3</Badge>{" "}
              {t("dashboard.student.howStep3")}
            </li>
            <li>
              <Badge variant="muted">4</Badge>{" "}
              {t("dashboard.student.howStep4")}
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
