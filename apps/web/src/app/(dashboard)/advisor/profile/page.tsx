import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkOrcidButton } from "@/features/orcid/link-button";
import { fetchOrcidPublications, fetchOrcidStatus } from "@/lib/api/orcid";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n/server";

export const metadata = { title: "Mi perfil ORCID · Tesis" };

export default async function AdvisorProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "advisor") redirect(`/${user.role}`);

  const { t, locale } = await getMessages();
  const dateLocale = locale === "en" ? "en-US" : "es-PE";
  const dash = t("panel.common.dash");

  const status = await fetchOrcidStatus();
  const publications = status.linked ? await fetchOrcidPublications() : [];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t("panel.common.advisor")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("panel.advisor.profile.title")}
        </h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          {t("panel.advisor.profile.subtitle")}
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t("panel.advisor.profile.status.title")}</CardTitle>
            <CardDescription>
              {status.linked
                ? t("panel.advisor.profile.status.linked")
                : t("panel.advisor.profile.status.notLinked")}
            </CardDescription>
          </div>
          <LinkOrcidButton linked={status.linked} />
        </CardHeader>
        {status.linked ? (
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <dt className="text-zinc-500">
                {t("panel.advisor.profile.field.orcidId")}
              </dt>
              <dd className="font-mono">
                {status.orcid_id ? (
                  <a
                    href={`https://orcid.org/${status.orcid_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {status.orcid_id}
                  </a>
                ) : (
                  dash
                )}
              </dd>
              <dt className="text-zinc-500">
                {t("panel.advisor.profile.field.affiliation")}
              </dt>
              <dd>{status.affiliation ?? dash}</dd>
              <dt className="text-zinc-500">
                {t("panel.advisor.profile.field.lastSync")}
              </dt>
              <dd>
                {status.last_sync
                  ? new Date(status.last_sync).toLocaleString(dateLocale)
                  : dash}
              </dd>
              <dt className="text-zinc-500">
                {t("panel.advisor.profile.field.publicationsCount")}
              </dt>
              <dd>{status.publications_count}</dd>
            </dl>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("panel.advisor.profile.publications.title", {
              count: publications.length,
            })}
          </CardTitle>
          <CardDescription>
            {t("panel.advisor.profile.publications.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {status.linked
                ? t("panel.advisor.profile.publications.emptyLinked")
                : t("panel.advisor.profile.publications.emptyNotLinked")}
            </p>
          ) : (
            <ul className="space-y-3">
              {publications.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-[color:rgba(125,211,252,0.12)]"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    {p.year ? (
                      <Badge variant="muted">{p.year}</Badge>
                    ) : null}
                    {p.doi ? (
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-zinc-500 hover:underline"
                      >
                        {p.doi}
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-1 font-medium text-zinc-900 dark:text-[color:var(--aurora-cream)]">
                    {p.title}
                  </p>
                  {p.journal ? (
                    <p className="text-xs italic text-zinc-500">{p.journal}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
