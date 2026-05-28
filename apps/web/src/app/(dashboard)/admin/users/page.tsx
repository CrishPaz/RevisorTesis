import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { UserForm } from "@/features/users/user-form";
import { UserRow } from "@/features/users/user-row";
import { fetchAdminUsers } from "@/lib/api/users";
import { getCurrentUser } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/types";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Usuarios · Tesis" };

type SearchParams = Promise<{
  role?: string;
  q?: string;
  inactive?: string;
}>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect(`/${user.role}`);

  const { t } = await getMessages();

  const params = await searchParams;
  const roleFilter = (params.role as UserRole | undefined) ?? null;
  const q = params.q ?? null;
  const showInactive = params.inactive === "1";

  const users = await fetchAdminUsers({
    role: roleFilter,
    q,
    is_active: showInactive ? null : true,
    limit: 500,
  });

  const counts = users.reduce<Record<UserRole, number>>(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1;
      return acc;
    },
    { student: 0, advisor: 0, coordinator: 0, admin: 0 },
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.administration")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.admin.users.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.admin.users.subtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label={t("panel.admin.users.kpi.students")} value={counts.student} />
        <KpiCard label={t("panel.admin.users.kpi.advisors")} value={counts.advisor} />
        <KpiCard label={t("panel.admin.users.kpi.coordinators")} value={counts.coordinator} />
        <KpiCard label={t("panel.admin.users.kpi.admins")} value={counts.admin} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("panel.admin.users.create.title")}</CardTitle>
          <CardDescription>
            {t("panel.admin.users.create.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.admin.users.list.title", { count: users.length })}
          </CardTitle>
          <CardDescription>
            {showInactive
              ? t("panel.admin.users.list.descriptionAll")
              : t("panel.admin.users.list.descriptionActive")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="GET" className="flex flex-wrap gap-2 text-sm">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("panel.admin.users.search.placeholder")}
              className="h-9 flex-1 min-w-[200px] rounded-md border border-zinc-200 bg-white px-3 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]"
            />
            <select
              name="role"
              defaultValue={roleFilter ?? ""}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]"
            >
              <option value="">{t("panel.admin.users.filter.allRoles")}</option>
              <option value="student">{t("panel.admin.users.kpi.students")}</option>
              <option value="advisor">{t("panel.admin.users.kpi.advisors")}</option>
              <option value="coordinator">{t("panel.admin.users.kpi.coordinators")}</option>
              <option value="admin">{t("panel.admin.users.kpi.admins")}</option>
            </select>
            <label className="inline-flex items-center gap-1 px-2 text-sm">
              <input
                type="checkbox"
                name="inactive"
                value="1"
                defaultChecked={showInactive}
              />
              {t("panel.admin.users.filter.includeInactive")}
            </label>
            <button
              type="submit"
              className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {t("panel.common.filter")}
            </button>
          </form>

          {users.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t("panel.admin.users.empty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <UserRow key={u.id} user={u} currentUserId={user.id} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
