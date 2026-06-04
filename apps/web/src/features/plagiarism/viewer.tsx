import { ApiError } from "@/lib/api/client";
import {
  fetchAnnotatedText,
  fetchPlagiarismMatches,
} from "@/lib/api/plagiarism";
import { getMessages } from "@/lib/i18n/server";
import { AnnotatedTextRenderer } from "./annotated-text-renderer";
import { PdfHighlightViewer } from "./pdf-highlight-viewer";
import { PlagiarismPanel } from "./matches-panel";

export async function PlagiarismViewer({
  sid,
  vid,
}: {
  sid: string;
  vid: string;
}) {
  const { t } = await getMessages();

  let annotated;
  try {
    annotated = await fetchAnnotatedText(sid, vid);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-[color:rgba(125,211,252,0.14)] dark:bg-[rgba(11,31,51,0.72)]">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-[color:var(--aurora-cream)]">
              {t("viewer.accessDenied.title")}
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {t("viewer.accessDenied")}
            </p>
          </div>
        </div>
      );
    }
    throw err;
  }

  const allMatches = await fetchPlagiarismMatches(sid, vid);
  const copyleaksMatches = allMatches.filter((m) => m.source === "copyleaks");
  const noMatches = annotated.matches.length === 0;
  const fileUrl = `/api/submissions/${sid}/versions/${vid}/file`;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
      <section className="flex h-full min-h-0 flex-col border-b border-zinc-200/80 lg:border-b-0 lg:border-r dark:border-[color:rgba(125,211,252,0.14)]">
        <div className="shrink-0 border-b border-zinc-200/80 px-4 py-2.5 dark:border-[color:rgba(125,211,252,0.12)]">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-[color:var(--aurora-cream)]">
            {t("viewer.annotatedText.title")}
          </h2>
          {noMatches ? (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {t("copyleaks.noMatches")}
            </p>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {annotated.is_pdf ? (
            <PdfHighlightViewer fileUrl={fileUrl} matches={annotated.matches} />
          ) : (
            <AnnotatedTextRenderer
              text={annotated.text}
              spans={annotated.spans}
            />
          )}
        </div>
      </section>

      <PlagiarismPanel
        matches={copyleaksMatches}
        emptyMessage={t("copyleaks.noMatches")}
        embedded
      />
    </div>
  );
}
