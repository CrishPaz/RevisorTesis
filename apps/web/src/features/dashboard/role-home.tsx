import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_LABEL_KEYS, type UserRole } from "@/lib/auth/types";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

type Props = {
  expectedRole: UserRole;
  description: string;
  upcoming: string[];
};

export async function RoleHome({ expectedRole, description, upcoming }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== expectedRole) {
    redirect(`/${user.role}`);
  }

  const { t, locale } = await getMessages();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t(ROLE_LABEL_KEYS[user.role])}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("home.greeting", { name: user.full_name.split(" ")[0] })}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {description}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.roleHome.sessionTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.roleHome.sessionDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-zinc-500">{t("dashboard.roleHome.fieldId")}</dt>
            <dd className="font-mono">{user.id}</dd>
            <dt className="text-zinc-500">
              {t("dashboard.roleHome.fieldEmail")}
            </dt>
            <dd>{user.email}</dd>
            <dt className="text-zinc-500">
              {t("dashboard.roleHome.fieldRole")}
            </dt>
            <dd>{t(ROLE_LABEL_KEYS[user.role])}</dd>
            <dt className="text-zinc-500">
              {t("dashboard.roleHome.fieldCreated")}
            </dt>
            <dd>
              {new Date(user.created_at).toLocaleString(
                locale === "en" ? "en-US" : "es-PE",
              )}
            </dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.roleHome.upcomingTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.roleHome.upcomingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
            {upcoming.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
