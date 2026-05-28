import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentOrcidForm } from "@/features/orcid/student-form";
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
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Estudiante
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Mi perfil ORCID</h1>
        <p className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
          Vincula tu ORCID iD para que tu nombre, afiliación y publicaciones
          aparezcan junto a tus avances.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Estado de la vinculación</CardTitle>
            <CardDescription>
              {status.linked
                ? "Tu ORCID iD ya fue validado y tus datos públicos están sincronizados."
                : "Aún no validaste tu ORCID iD. Ingresalo abajo para sincronizar tus datos."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status.linked ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <dt className="text-zinc-500">ORCID iD</dt>
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
              <dt className="text-zinc-500">Nombre público</dt>
              <dd>{status.full_name ?? dash}</dd>
              <dt className="text-zinc-500">Afiliación</dt>
              <dd>{status.affiliation ?? dash}</dd>
              <dt className="text-zinc-500">Última sincronización</dt>
              <dd>
                {status.last_sync
                  ? new Date(status.last_sync).toLocaleString("es-PE")
                  : dash}
              </dd>
              <dt className="text-zinc-500">Publicaciones</dt>
              <dd>{status.publications_count}</dd>
            </dl>
          ) : null}
          <StudentOrcidForm initial={status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Publicaciones públicas ({publications.length})
          </CardTitle>
          <CardDescription>
            Lo que ORCID devuelve como obra pública para tu iD. Si falta algo,
            actualizá tu perfil en orcid.org y volvé a validar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publications.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {status.linked
                ? "Tu ORCID no tiene publicaciones públicas registradas."
                : "Aún no validaste tu ORCID. Una vez que lo hagas, listamos tus papers acá."}
            </p>
          ) : (
            <ul className="space-y-3">
              {publications.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-[color:rgba(125,211,252,0.12)]"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    {p.year ? <Badge variant="muted">{p.year}</Badge> : null}
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
