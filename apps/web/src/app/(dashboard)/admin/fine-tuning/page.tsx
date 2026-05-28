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
import {
  CreateJobButton,
  JobActionButtons,
} from "@/features/fine-tuning/actions-bar";
import { ModelToggle } from "@/features/fine-tuning/model-toggle";
import {
  fetchFineTuningJobs,
  fetchFineTuningStats,
  fetchModelPreference,
  type FineTuningStatus,
} from "@/lib/api/fine-tuning";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Fine-tuning · Tesis" };

function statusVariant(s: FineTuningStatus) {
  switch (s) {
    case "succeeded":
      return "success" as const;
    case "failed":
    case "cancelled":
      return "destructive" as const;
    case "running":
    case "queued":
    case "uploading":
      return "warning" as const;
    case "dataset_ready":
      return "muted" as const;
  }
}

export default async function FineTuningPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(`/${user.role}`);

  const { t, locale } = await getMessages();
  const dateLocale = locale === "en" ? "en-US" : "es-PE";

  const [stats, jobs, pref] = await Promise.all([
    fetchFineTuningStats(),
    fetchFineTuningJobs(),
    fetchModelPreference(),
  ]);

  const exportReason = !stats.ready_to_export
    ? t("panel.admin.ft.exportReason")
    : undefined;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.administrator")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.admin.ft.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.admin.ft.subtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={t("panel.admin.ft.kpi.eligible")}
          value={stats.total_eligible}
          helper={t("panel.admin.ft.kpi.thresholdHelper", {
            value: stats.min_examples_threshold,
          })}
        />
        <KpiCard
          label={t("panel.admin.ft.kpi.modified")}
          value={stats.by_action.modified ?? 0}
        />
        <KpiCard
          label={t("panel.admin.ft.kpi.rejected")}
          value={stats.by_action.rejected ?? 0}
        />
        <KpiCard
          label={t("panel.admin.ft.kpi.programmaticTuning")}
          value={
            stats.provider_available
              ? t("panel.admin.ft.kpi.available")
              : t("panel.admin.ft.kpi.unavailable")
          }
          tone={stats.provider_available ? "success" : "warning"}
          helper={t("panel.admin.ft.kpi.tuningHelper")}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.ft.newJob.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.ft.newJob.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <CreateJobButton
            disabled={!stats.ready_to_export}
            reason={exportReason}
          />
          {!stats.ready_to_submit && stats.provider_available ? (
            <p className="text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {t("panel.admin.ft.belowThreshold", {
                current: stats.total_eligible,
                threshold: stats.min_examples_threshold,
              })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.admin.ft.jobsList.title", { count: jobs.length })}
          </CardTitle>
          <CardDescription>
            {t("panel.admin.ft.jobsList.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("panel.admin.ft.jobsList.empty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((j) => (
                <li
                  key={j.id}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-[color:rgba(125,211,252,0.12)]"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Badge variant={statusVariant(j.status)}>{j.status}</Badge>
                    <Badge variant="muted">
                      {t("panel.admin.ft.examples", { count: j.examples_count })}
                    </Badge>
                    <span className="font-mono text-xs text-zinc-500">
                      {t("panel.admin.ft.baseModel", { value: j.base_model })}
                    </span>
                    {j.openai_job_id ? (
                      <span className="font-mono text-xs text-zinc-500">
                        {t("panel.admin.ft.jobId", { value: j.openai_job_id })}
                      </span>
                    ) : null}
                    {j.fine_tuned_model ? (
                      <Badge variant="success">
                        {t("panel.admin.ft.modelLabel", {
                          value: j.fine_tuned_model,
                        })}
                      </Badge>
                    ) : null}
                  </div>
                  {j.error ? (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {j.error}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    {t("panel.admin.ft.created", {
                      value: new Date(j.created_at).toLocaleString(dateLocale),
                    })}
                    {j.submitted_at
                      ? t("panel.admin.ft.submittedSuffix", {
                          value: new Date(j.submitted_at).toLocaleString(
                            dateLocale,
                          ),
                        })
                      : ""}
                    {j.finished_at
                      ? t("panel.admin.ft.finishedSuffix", {
                          value: new Date(j.finished_at).toLocaleString(
                            dateLocale,
                          ),
                        })
                      : ""}
                  </p>
                  <div className="mt-2">
                    <JobActionButtons
                      job={j}
                      openaiAvailable={stats.provider_available}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.ft.modelAb.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.ft.modelAb.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModelToggle pref={pref} />
        </CardContent>
      </Card>
    </div>
  );
}
