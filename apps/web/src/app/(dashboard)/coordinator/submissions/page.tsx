import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiltersBar } from "@/features/submissions/filters-bar";
import { SelectableSubmissionsList } from "@/features/submissions/selectable-list";
import { fetchPrograms } from "@/lib/api/programs";
import {
  fetchEligibleAdvisors,
  fetchSubmissions,
  type SubmissionFilters,
} from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Avances del programa · Tesis" };

export default async function CoordinatorSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "coordinator" && user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  const sp = await searchParams;
  const filters: SubmissionFilters = {
    program_id: typeof sp.program_id === "string" ? sp.program_id : undefined,
    status: typeof sp.status === "string" ? sp.status : undefined,
    fit_alert: sp.fit_alert === "true" ? true : undefined,
  };

  const [submissions, programs, advisors, { t }] = await Promise.all([
    fetchSubmissions(filters),
    fetchPrograms(),
    fetchEligibleAdvisors(),
    getMessages(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("submission.coordinator.badge")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("submission.coordinator.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("submission.coordinator.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("submission.coordinator.filters.title")}</CardTitle>
          <CardDescription>
            {t("submission.coordinator.filters.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FiltersBar programs={programs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("submission.coordinator.results.title", {
              n: submissions.length,
            })}
          </CardTitle>
          <CardDescription>
            {t("submission.coordinator.results.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("submission.coordinator.noResults")}
            </p>
          ) : (
            <SelectableSubmissionsList
              submissions={submissions}
              advisors={advisors}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
