"use server";

import { apiFetch, ApiError } from "@/lib/api/client";
import type { AnnotatedTextResponse, PlagiarismMatch } from "@/lib/api/types";

export async function fetchPlagiarismMatches(
  submissionId: string,
  versionId: string,
): Promise<PlagiarismMatch[]> {
  try {
    return await apiFetch<PlagiarismMatch[]>(
      `/api/v1/submissions/${submissionId}/versions/${versionId}/plagiarism`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function fetchAnnotatedText(
  submissionId: string,
  versionId: string,
): Promise<AnnotatedTextResponse> {
  return apiFetch<AnnotatedTextResponse>(
    `/api/v1/submissions/${submissionId}/versions/${versionId}/annotated-text`,
  );
}
