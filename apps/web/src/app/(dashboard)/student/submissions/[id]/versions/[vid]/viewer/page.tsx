import Link from "next/link";

import { PlagiarismViewer } from "@/features/plagiarism/viewer";
import { getMessages } from "@/lib/i18n/server";

type Params = Promise<{ id: string; vid: string }>;

export async function generateMetadata() {
  const { t } = await getMessages();
  return { title: `${t("viewer.title")} · Tesis` };
}

export default async function PlagiarismViewerPage({
  params,
}: {
  params: Params;
}) {
  const { id, vid } = await params;
  const { t } = await getMessages();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/student/submissions/${id}`}
          className="text-sm text-zinc-500 hover:underline"
        >
          ← {t("action.back")}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">{t("viewer.title")}</h1>
      <PlagiarismViewer sid={id} vid={vid} />
    </div>
  );
}
