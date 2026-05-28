import { ApiError } from "@/lib/api/client";
import { fetchAnnotatedText } from "@/lib/api/plagiarism";
import { fetchPlagiarismMatches } from "@/lib/api/plagiarism";
import { getMessages } from "@/lib/i18n/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnnotatedTextRenderer } from "./annotated-text-renderer";
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
        <Card>
          <CardHeader>
            <CardTitle>{t("viewer.accessDenied.title")}</CardTitle>
            <CardDescription>{t("viewer.accessDenied")}</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    throw err;
  }

  const allMatches = await fetchPlagiarismMatches(sid, vid);
  const copyleaksMatches = allMatches.filter((m) => m.source === "copyleaks");

  const noMatches = annotated.spans.length === 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("viewer.annotatedText.title")}</CardTitle>
          {noMatches ? (
            <CardDescription>{t("copyleaks.noMatches")}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <AnnotatedTextRenderer text={annotated.text} spans={annotated.spans} />
        </CardContent>
      </Card>

      <PlagiarismPanel
        matches={copyleaksMatches}
        emptyMessage={t("copyleaks.noMatches")}
      />
    </div>
  );
}
