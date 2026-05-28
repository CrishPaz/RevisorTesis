import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { fetchFineTuningStats, fetchModelPreference } from "@/lib/api/fine-tuning";
import { fetchPrograms } from "@/lib/api/programs";
import { fetchStatsOverview } from "@/lib/api/stats";
import { fetchAdminUsers } from "@/lib/api/users";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_LABEL_KEYS } from "@/lib/auth/types";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Administrador · Tesis" };

export default async function AdminHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(`/${user.role}`);

  const { t } = await getMessages();
  const [overview, users, programs, ftStats, pref] = await Promise.all([
    fetchStatsOverview(),
    fetchAdminUsers({ limit: 500 }),
    fetchPrograms(),
    fetchFineTuningStats(),
    fetchModelPreference(),
  ]);

  const totalUsers = users.length;
  const usersByRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const activeModel =
    pref.use_fine_tuned && pref.fine_tuned_model
      ? pref.fine_tuned_model
      : pref.model;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t(ROLE_LABEL_KEYS.admin)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("home.greeting", { name: user.full_name.split(" ")[0] })}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("dashboard.admin.subtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label={t("dashboard.admin.kpiUsers")}
          value={totalUsers}
          helper={t("dashboard.admin.kpiUsersHelper", {
            count: programs.length,
          })}
        />
        <KpiCard
          label={t("kpi.totalSubmissions")}
          value={overview.total_submissions}
        />
        <KpiCard
          label={t("dashboard.admin.kpiPlagiarismAlerts")}
          value={overview.plagiarism_alerts}
          tone={overview.plagiarism_alerts > 0 ? "warning" : "default"}
        />
        <KpiCard
          label={t("dashboard.admin.kpiOrcidAlerts")}
          value={overview.advisor_fit_alerts}
          tone={overview.advisor_fit_alerts > 0 ? "warning" : "default"}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.admin.roleDistributionTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.admin.roleDistributionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(["student", "advisor", "coordinator", "admin"] as const).map(
                (r) => (
                  <li key={r} className="flex items-center justify-between">
                    <span>{t(ROLE_LABEL_KEYS[r])}</span>
                    <Badge variant="muted">{usersByRole[r] ?? 0}</Badge>
                  </li>
                ),
              )}
            </ul>
            <p className="mt-3 text-xs text-zinc-500">
              <Link href="/admin/users" className="underline">
                {t("dashboard.admin.manageUsers")}
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.admin.fineTuningTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.admin.fineTuningDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t("dashboard.admin.activeModel")}</span>
              <Badge variant={pref.use_fine_tuned ? "success" : "muted"}>
                {activeModel}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{t("dashboard.admin.eligibleFeedback")}</span>
              <Badge variant="muted">
                {ftStats.total_eligible} / {ftStats.min_examples_threshold}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{t("dashboard.admin.programmaticTuning")}</span>
              <Badge
                variant={ftStats.provider_available ? "success" : "warning"}
              >
                {ftStats.provider_available
                  ? t("dashboard.admin.yes")
                  : t("dashboard.admin.no")}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              <Link href="/admin/settings" className="underline">
                {t("dashboard.admin.adjustSettings")}
              </Link>{" "}
              ·{" "}
              <Link href="/admin/fine-tuning" className="underline">
                {t("dashboard.admin.viewPipeline")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.admin.quickAccessTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <li>
              <Link href="/admin/users" className="underline">
                {t("dashboard.admin.quickCreateUsers")}
              </Link>
            </li>
            <li>
              <Link href="/admin/programs" className="underline">
                {t("dashboard.admin.quickManagePrograms")}
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="underline">
                {t("dashboard.admin.quickSettings")}
              </Link>
            </li>
            <li>
              <Link href="/admin/fine-tuning" className="underline">
                {t("dashboard.admin.quickFineTuning")}
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
