import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelToggle } from "@/features/fine-tuning/model-toggle";
import { FtThresholdForm } from "@/features/settings/ft-threshold-form";
import { fetchModelPreference } from "@/lib/api/fine-tuning";
import { fetchSystemSettings } from "@/lib/api/settings";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Configuración · Tesis" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(`/${user.role}`);

  const { t, locale } = await getMessages();
  const dateLocale = locale === "en" ? "en-US" : "es-PE";

  const [settings, pref] = await Promise.all([
    fetchSystemSettings(),
    fetchModelPreference(),
  ]);
  const ftRow = settings.find((s) => s.key === "ai.fine_tuning");
  const minExamples = Number(ftRow?.value.min_examples ?? 500);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.administration")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.admin.settings.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.admin.settings.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.settings.model.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.settings.model.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModelToggle pref={pref} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.settings.ft.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.settings.ft.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FtThresholdForm minExamples={minExamples} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.settings.state.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.settings.state.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {settings.map((s) => (
              <div key={s.key} className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  {s.key}
                </dt>
                <dd>
                  <pre className="overflow-x-auto rounded-md bg-zinc-50 p-2 text-xs dark:bg-[rgba(11,31,51,0.55)]">
                    {JSON.stringify(s.value, null, 2)}
                  </pre>
                  {s.updated_at ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {t("panel.admin.settings.state.lastUpdate", {
                        value: new Date(s.updated_at).toLocaleString(dateLocale),
                      })}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-400">
                      {t("panel.admin.settings.state.defaultValue")}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
