import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PlagiarismViewer } from "@/features/plagiarism/viewer";
import { SimilarityLegend } from "@/features/plagiarism/similarity-legend";
import { ApiError } from "@/lib/api/client";
import { fetchSubmission } from "@/lib/api/submissions";
import { getCurrentUser } from "@/lib/auth/session";
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
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect(`/${user.role}`);

  const { id, vid } = await params;
  const { t } = await getMessages();

  let submission;
  try {
    submission = await fetchSubmission(id);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      notFound();
    }
    throw err;
  }

  const version = submission.versions.find((v) => v.id === vid);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-zinc-200/80 bg-white/70 px-4 py-3 backdrop-blur-md dark:border-[color:rgba(125,211,252,0.14)] dark:bg-[rgba(6,18,31,0.82)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/student/submissions/${id}`}
              className="shrink-0 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-[color:rgba(125,211,252,0.22)] dark:text-[color:var(--aurora-cream-dim)] dark:hover:bg-[rgba(14,165,233,0.12)]"
            >
              ← {t("action.back")}
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-[color:var(--aurora-cream)]">
                {t("viewer.title")}
              </h1>
              <p className="truncate text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
                {submission.title}
                {version ? ` · v${version.version_number}` : null}
              </p>
            </div>
          </div>
          <SimilarityLegend />
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <PlagiarismViewer sid={id} vid={vid} />
      </div>
    </div>
  );
}
