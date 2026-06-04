import { redirect } from "next/navigation";

import { StudentOrcidForm } from "@/features/orcid/student-form";
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
import {
  fetchStudentOrcidPublications,
  fetchStudentOrcidStatus,
} from "@/lib/api/orcid";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Mi perfil ORCID · Tesis" };

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const status = await fetchStudentOrcidStatus();
  const publications = status.linked
    ? await fetchStudentOrcidPublications()
    : [];

  const dash = "—";

  return (
    <OrcidPage>
      <OrcidHero
        role="Estudiante"
        title="Mi perfil ORCID"
        subtitle="Vincula tu ORCID iD para que tu nombre, afiliación y publicaciones aparezcan junto a tus avances."
      />

      <OrcidCard>
        <OrcidCardHeader
          title="Estado de la vinculación"
          description={
            status.linked
              ? "Tu ORCID iD ya fue validado y tus datos públicos están sincronizados."
              : "Aún no validaste tu ORCID iD. Ingresalo abajo para sincronizar tus datos."
          }
        />
        <OrcidCardBody className="space-y-6">
          {status.linked ? (
            <OrcidDataGrid
              fields={[
                {
                  label: "ORCID iD",
                  value: status.orcid_id ? (
                    <OrcidIdLink orcidId={status.orcid_id} />
                  ) : (
                    dash
                  ),
                },
                { label: "Nombre público", value: status.full_name ?? dash },
                { label: "Afiliación", value: status.affiliation ?? dash },
                {
                  label: "Última sincronización",
                  value: status.last_sync
                    ? new Date(status.last_sync).toLocaleString("es-PE")
                    : dash,
                },
                {
                  label: "Publicaciones",
                  value: status.publications_count,
                },
              ]}
            />
          ) : null}
          <StudentOrcidForm initial={status} />
        </OrcidCardBody>
      </OrcidCard>

      <OrcidCard>
        <OrcidCardHeader
          title={`Publicaciones públicas (${publications.length})`}
          description="Lo que ORCID devuelve como obra pública para tu iD. Si falta algo, actualizá tu perfil en orcid.org y volvé a validar."
        />
        <OrcidCardBody>
          <OrcidPublicationList
            publications={publications}
            linked={status.linked}
            emptyLinked="Tu ORCID no tiene publicaciones públicas registradas."
            emptyNotLinked="Aún no validaste tu ORCID. Una vez que lo hagas, listamos tus papers acá."
          />
        </OrcidCardBody>
      </OrcidCard>
    </OrcidPage>
  );
}
