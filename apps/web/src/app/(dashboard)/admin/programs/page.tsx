import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgramForm } from "@/features/programs/program-form";
import { ProgramRow } from "@/features/programs/program-row";
import { fetchPrograms } from "@/lib/api/programs";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Programas · Tesis" };

export default async function ProgramsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(`/${user.role}`);

  const { t } = await getMessages();

  const programs = await fetchPrograms();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.administration")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.admin.programs.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.admin.programs.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.programs.create.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.programs.create.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.admin.programs.list.title", { count: programs.length })}
          </CardTitle>
          <CardDescription>
            {t("panel.admin.programs.list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("panel.admin.programs.empty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {programs.map((p) => (
                <ProgramRow key={p.id} program={p} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
