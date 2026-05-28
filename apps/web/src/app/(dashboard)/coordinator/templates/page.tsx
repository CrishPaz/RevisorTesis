import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TemplateCard } from "@/features/templates/template-card";
import { TemplateForm } from "@/features/templates/template-form";
import { fetchPrograms } from "@/lib/api/programs";
import { fetchTemplates } from "@/lib/api/templates";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Documentos patrón · Tesis" };

export default async function CoordinatorTemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "coordinator" && user.role !== "admin") {
    redirect(`/${user.role}`);
  }

  const { t } = await getMessages();

  const [programs, templates] = await Promise.all([
    fetchPrograms(),
    fetchTemplates(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.coordinator")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.coordinator.templates.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.coordinator.templates.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.coordinator.templates.upload.title")}</CardTitle>
          <CardDescription>
            {t("panel.coordinator.templates.upload.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm programs={programs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.coordinator.templates.list.title", {
              count: templates.length,
            })}
          </CardTitle>
          <CardDescription>
            {t("panel.coordinator.templates.list.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("panel.coordinator.templates.empty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {templates.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
