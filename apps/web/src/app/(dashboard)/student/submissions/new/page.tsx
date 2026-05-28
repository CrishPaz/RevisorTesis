import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BulkSubmissionForm } from "@/features/submissions/bulk-submission-form";
import { fetchPrograms } from "@/lib/api/programs";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Subir avances · Tesis" };

export default async function NewSubmissionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const [programs, { t }] = await Promise.all([
    fetchPrograms(),
    getMessages(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/student/submissions"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-[color:var(--aurora-cream)]"
        >
          {t("submission.list.backToList")}
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("submission.new.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("submission.new.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("submission.new.card.title")}</CardTitle>
          <CardDescription>
            {t("submission.new.card.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkSubmissionForm programs={programs} />
        </CardContent>
      </Card>
    </div>
  );
}
