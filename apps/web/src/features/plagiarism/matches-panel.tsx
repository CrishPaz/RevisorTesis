import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlagiarismMatch } from "@/lib/api/types";
import { getMessages } from "@/lib/i18n/server";

function similarityVariant(sim: number) {
  if (sim >= 0.95) return "destructive" as const;
  if (sim >= 0.85) return "warning" as const;
  return "muted" as const;
}

function groupByMatchedVersion(
  matches: PlagiarismMatch[],
): {
  matched_version_id: string;
  matched_student_name: string;
  matched_submission_title: string;
  items: PlagiarismMatch[];
}[] {
  const map = new Map<
    string,
    {
      matched_version_id: string;
      matched_student_name: string;
      matched_submission_title: string;
      items: PlagiarismMatch[];
    }
  >();
  for (const m of matches) {
    const key = m.matched_version_id;
    if (!map.has(key)) {
      map.set(key, {
        matched_version_id: m.matched_version_id,
        matched_student_name: m.matched_student_name,
        matched_submission_title: m.matched_submission_title,
        items: [],
      });
    }
    map.get(key)!.items.push(m);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      Math.max(...b.items.map((i) => i.similarity)) -
      Math.max(...a.items.map((i) => i.similarity)),
  );
}

function MatchesList({
  groups,
  t,
}: {
  groups: ReturnType<typeof groupByMatchedVersion>;
  t: Awaited<ReturnType<typeof getMessages>>["t"];
}) {
  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const groupMax = Math.max(...g.items.map((i) => i.similarity));
        return (
          <div
            key={g.matched_version_id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-[color:rgba(125,211,252,0.12)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">
                {g.matched_student_name} —{" "}
                <span className="text-zinc-600 dark:text-[color:var(--aurora-cream-dim)]">
                  {g.matched_submission_title}
                </span>
              </p>
              <Badge variant={similarityVariant(groupMax)}>
                {t("panel.plagiarism.upTo", {
                  value: (groupMax * 100).toFixed(1),
                })}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {g.items.length === 1
                ? t("panel.plagiarism.fragmentsOne", { count: g.items.length })
                : t("panel.plagiarism.fragmentsMany", {
                    count: g.items.length,
                  })}
            </p>

            <ul className="mt-3 space-y-3">
              {g.items.map((m) => (
                <li
                  key={m.id}
                  className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-[rgba(11,31,51,0.55)]/60"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={similarityVariant(m.similarity)}>
                      {(m.similarity * 100).toFixed(1)}%
                    </Badge>
                    {m.source_chunk.section ? (
                      <span className="text-xs text-zinc-500">
                        {t("panel.plagiarism.inSection", {
                          section: m.source_chunk.section,
                        })}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {t("panel.plagiarism.sourceFragment")}
                      </p>
                      <p className="mt-1 line-clamp-6 text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
                        {m.source_chunk.text}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {t("panel.plagiarism.matchedFragment")}
                      </p>
                      <p className="mt-1 line-clamp-6 text-zinc-700 dark:text-[color:var(--aurora-cream-dim)]">
                        {m.matched_chunk.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export async function PlagiarismPanel({
  matches,
  emptyMessage,
  embedded = false,
}: {
  matches: PlagiarismMatch[];
  emptyMessage: string;
  embedded?: boolean;
}) {
  const { t } = await getMessages();

  if (matches.length === 0) {
    if (embedded) {
      return (
        <section className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-zinc-200/80 px-4 py-2.5 dark:border-[color:rgba(125,211,252,0.12)]">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-[color:var(--aurora-cream)]">
              {t("viewer.matches.title")}
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-sm text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
              {emptyMessage}
            </p>
          </div>
        </section>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("panel.plagiarism.title")}</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groups = groupByMatchedVersion(matches);
  const totalGroups = groups.length;
  const highestSim = Math.max(...matches.map((m) => m.similarity));
  const summary =
    totalGroups === 1
      ? t("panel.plagiarism.summaryOne", {
          count: totalGroups,
          max: (highestSim * 100).toFixed(1),
        })
      : t("panel.plagiarism.summaryMany", {
          count: totalGroups,
          max: (highestSim * 100).toFixed(1),
        });

  if (embedded) {
    return (
      <section className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-zinc-200/80 px-4 py-2.5 dark:border-[color:rgba(125,211,252,0.12)]">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-[color:var(--aurora-cream)]">
            {t("viewer.matches.title")}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-[color:var(--aurora-cream-dim)]">
            {summary}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <MatchesList groups={groups} t={t} />
        </div>
      </section>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("panel.plagiarism.title")}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <MatchesList groups={groups} t={t} />
      </CardContent>
    </Card>
  );
}
