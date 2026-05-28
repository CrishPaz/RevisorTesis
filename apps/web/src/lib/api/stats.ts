"use server";

import { apiFetch } from "@/lib/api/client";

export type StatusCount = { status: string; count: number };
export type ProgramGrade = {
  program_id: string;
  program_code: string;
  program_name: string;
  average_grade: number;
  submissions_count: number;
};
export type StatsOverview = {
  total_submissions: number;
  total_advisors_with_orcid: number;
  submissions_by_status: StatusCount[];
  avg_ai_grade: number | null;
  avg_ai_percentage: number | null;
  ai_human_concordance_pct: number | null;
  plagiarism_alerts: number;
  advisor_fit_alerts: number;
  low_compliance_submissions: number;
  citations_total: number;
  citations_problematic: number;
  grades_per_program: ProgramGrade[];
};
export type ActivityItem = {
  kind: string;
  occurred_at: string;
  submission_id: string;
  submission_title: string;
  actor_name: string;
  description: string;
};

// Stats are heavy on the backend (10 sequential SQL queries with multi-table
// JOINs). They're also the SAME for every coordinator/admin in the same
// program scope, so caching the response by URL is safe. Revalidate every 30s
// so the dashboard stays fresh enough without hammering the API on every nav.
// Mutations that change the underlying data call updateTag("stats").
export async function fetchStatsOverview(programId?: string): Promise<StatsOverview> {
  const qs = programId ? `?program_id=${programId}` : "";
  return apiFetch<StatsOverview>(`/api/v1/stats/overview${qs}`, {
    cache: "force-cache",
    next: { tags: ["stats", "stats:overview"], revalidate: 30 },
  });
}

export async function fetchStatsActivity(
  limit = 15,
  programId?: string,
): Promise<ActivityItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (programId) params.set("program_id", programId);
  return apiFetch<ActivityItem[]>(`/api/v1/stats/activity?${params.toString()}`, {
    cache: "force-cache",
    next: { tags: ["stats", "stats:activity"], revalidate: 15 },
  });
}
