import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmissionRow } from "@/features/submissions/submission-row";
import { fetchSubmissions } from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Mis avances · Tesis" };

export default async function StudentSubmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const [submissions, { t }] = await Promise.all([
    fetchSubmissions(),
    getMessages(),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {t("submission.list.studentBadge")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("submission.list.title")}
          </h1>
          <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
            {t("submission.list.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/student/submissions/new">
            {t("submission.list.newButton")}
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("submission.list.cardTitle", { n: submissions.length })}
          </CardTitle>
          <CardDescription>
            {t("submission.list.cardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="space-y-3 text-sm text-zinc-500">
              <p>{t("submission.list.empty")}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/submissions/new">
                  {t("submission.list.createFirst")}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {submissions.map((s) => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  basePath="/student/submissions"
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
