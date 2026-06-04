import { redirect } from "next/navigation";

import { LinkOrcidButton } from "@/features/orcid/link-button";
import {
  OrcidCard,
  OrcidCardBody,
  OrcidCardHeader,
  OrcidDataGrid,
  OrcidHero,
  OrcidIdLink,
  OrcidPage,
  OrcidPublicationList,
} from "@/features/orcid/orcid-ui";
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
    <OrcidPage>
      <OrcidHero
        role={t("panel.common.advisor")}
        title={t("panel.advisor.profile.title")}
        subtitle={t("panel.advisor.profile.subtitle")}
      />

      <OrcidCard>
        <OrcidCardHeader
          title={t("panel.advisor.profile.status.title")}
          description={
            status.linked
              ? t("panel.advisor.profile.status.linked")
              : t("panel.advisor.profile.status.notLinked")
          }
          action={<LinkOrcidButton linked={status.linked} />}
        />
        {status.linked ? (
          <OrcidCardBody>
            <OrcidDataGrid
              fields={[
                {
                  label: t("panel.advisor.profile.field.orcidId"),
                  value: status.orcid_id ? (
                    <OrcidIdLink orcidId={status.orcid_id} />
                  ) : (
                    dash
                  ),
                },
                {
                  label: t("panel.advisor.profile.field.affiliation"),
                  value: status.affiliation ?? dash,
                },
                {
                  label: t("panel.advisor.profile.field.lastSync"),
                  value: status.last_sync
                    ? new Date(status.last_sync).toLocaleString(dateLocale)
                    : dash,
                },
                {
                  label: t("panel.advisor.profile.field.publicationsCount"),
                  value: status.publications_count,
                },
              ]}
            />
          </OrcidCardBody>
        ) : null}
      </OrcidCard>

      <OrcidCard>
        <OrcidCardHeader
          title={t("panel.advisor.profile.publications.title", {
            count: publications.length,
          })}
          description={t("panel.advisor.profile.publications.description")}
        />
        <OrcidCardBody>
          <OrcidPublicationList
            publications={publications}
            linked={status.linked}
            emptyLinked={t("panel.advisor.profile.publications.emptyLinked")}
            emptyNotLinked={t(
              "panel.advisor.profile.publications.emptyNotLinked",
            )}
          />
        </OrcidCardBody>
      </OrcidCard>
    </OrcidPage>
  );
}
