"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type {
  ReportType,
  SubmissionDetail,
  SubmissionSummary,
  SubmissionVersionDetail,
} from "@/lib/api/types";

// Keep in sync with experimental.serverActions.bodySizeLimit in next.config.ts
// and MAX_FILE_BYTES in features/submissions/version-uploader.tsx.
const MAX_VERSION_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_VERSION_MIME = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
]);

export type SubmissionFilters = {
  program_id?: string;
  status?: string;
  advisor_id?: string;
  fit_alert?: boolean;
};

export async function fetchSubmissions(
  filters: SubmissionFilters = {},
): Promise<SubmissionSummary[]> {
  const qs = new URLSearchParams();
  if (filters.program_id) qs.set("program_id", filters.program_id);
  if (filters.status) qs.set("status", filters.status);
  if (filters.advisor_id) qs.set("advisor_id", filters.advisor_id);
  if (filters.fit_alert !== undefined) qs.set("fit_alert", String(filters.fit_alert));
  const path = qs.toString()
    ? `/api/v1/submissions?${qs.toString()}`
    : "/api/v1/submissions";
  return apiFetch<SubmissionSummary[]>(path);
}

export type AdvisorOption = {
  id: string;
  full_name: string;
  email: string;
  orcid_id: string | null;
  orcid_linked: boolean;
};

export async function fetchEligibleAdvisors(): Promise<AdvisorOption[]> {
  return apiFetch<AdvisorOption[]>("/api/v1/submissions/advisors");
}

export async function assignAdvisorAction(
  submissionId: string,
  advisorId: string | null,
): Promise<void> {
  await apiFetch(`/api/v1/submissions/${submissionId}/advisor`, {
    method: "PATCH",
    body: { advisor_id: advisorId },
  });
  revalidatePath("/coordinator/submissions");
  revalidatePath("/coordinator");
}

// ---- Bulk ----

export type BulkOperation = "reprocess_ai" | "set_status" | "assign_advisor";

export type BulkOutcome = {
  submission_id: string;
  ok: boolean;
  detail: string;
};

export type BulkResponse = {
  operation: string;
  total: number;
  succeeded: number;
  failed: number;
  outcomes: BulkOutcome[];
};

export type BulkPayload = {
  operation: BulkOperation;
  submission_ids: string[];
  status?: string | null;
  advisor_id?: string | null;
};

export async function bulkApplyAction(payload: BulkPayload): Promise<BulkResponse> {
  const result = await apiFetch<BulkResponse>("/api/v1/submissions/bulk", {
    method: "POST",
    body: payload,
  });
  revalidatePath("/coordinator/submissions");
  revalidatePath("/coordinator");
  return result;
}

// Used by the polling progress UI — fetches just the latest_version_status of
// the given IDs.
export async function fetchSubmissionStatusMap(
  ids: string[],
): Promise<Record<string, string | null>> {
  if (ids.length === 0) return {};
  const all = await fetchSubmissions();
  const wanted = new Set(ids);
  const out: Record<string, string | null> = {};
  for (const s of all) {
    if (wanted.has(s.id)) out[s.id] = s.latest_version_status ?? null;
  }
  return out;
}

export async function fetchSubmission(id: string): Promise<SubmissionDetail> {
  return apiFetch<SubmissionDetail>(`/api/v1/submissions/${id}`);
}

export type CreateSubmissionResult =
  | { ok: true; submission: SubmissionDetail }
  | { ok: false; error: string };

export async function createSubmissionAction(
  _prev: CreateSubmissionResult | null,
  formData: FormData,
): Promise<CreateSubmissionResult> {
  const program_id = String(formData.get("program_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const chapter = String(formData.get("chapter") ?? "").trim() || null;
  if (!program_id || !title) {
    return { ok: false, error: "Programa y título son requeridos" };
  }
  try {
    const submission = await apiFetch<SubmissionDetail>(
      "/api/v1/submissions",
      {
        method: "POST",
        body: { program_id, title, chapter },
      },
    );
    revalidatePath("/student/submissions");
    return { ok: true, submission };
  } catch (err) {
    return {
      ok: false,
      error: extractErrorMessage(err, "No se pudo crear el avance"),
    };
  }
}

// ---- Bulk submission upload (one file = one new submission) ----

export type BulkCreateResult =
  | { ok: true; submissions: SubmissionDetail[] }
  | { ok: false; error: string };

// Per-file: keep in sync with MAX_VERSION_FILE_BYTES below.
const MAX_BULK_FILES = 10;

export async function createBulkSubmissionsAction(
  _prev: BulkCreateResult | null,
  formData: FormData,
): Promise<BulkCreateResult> {
  const program_id = String(formData.get("program_id") ?? "");
  if (!program_id) {
    return { ok: false, error: "Selecciona un programa académico" };
  }
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, error: "Selecciona al menos un archivo" };
  }
  if (files.length > MAX_BULK_FILES) {
    return {
      ok: false,
      error: `Máximo ${MAX_BULK_FILES} archivos por carga`,
    };
  }
  for (const f of files) {
    if (f.size > MAX_VERSION_FILE_BYTES) {
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      return {
        ok: false,
        error: `'${f.name}' pesa ${sizeMb} MB y el máximo por archivo es 5 MB.`,
      };
    }
    const nameLower = f.name.toLowerCase();
    const extOk = nameLower.endsWith(".docx") || nameLower.endsWith(".pdf");
    const mimeOk = f.type === "" ? extOk : ACCEPTED_VERSION_MIME.has(f.type);
    if (!extOk || !mimeOk) {
      return {
        ok: false,
        error: `'${f.name}' no es .docx ni .pdf.`,
      };
    }
  }

  // Build the multipart payload the FastAPI bulk endpoint expects.
  const upstream = new FormData();
  upstream.append("program_id", program_id);
  const titles = formData.getAll("titles");
  const chapters = formData.getAll("chapters");
  for (const f of files) upstream.append("files", f);
  for (const t of titles) upstream.append("titles", String(t ?? ""));
  for (const c of chapters) upstream.append("chapters", String(c ?? ""));

  try {
    const submissions = await apiFetch<SubmissionDetail[]>(
      "/api/v1/submissions/bulk",
      { method: "POST", formData: upstream },
    );
    revalidatePath("/student/submissions");
    revalidatePath("/student");
    return { ok: true, submissions };
  } catch (err) {
    return {
      ok: false,
      error: extractErrorMessage(err, "No se pudo subir los avances"),
    };
  }
}

export type UploadVersionResult =
  | { ok: true; version: SubmissionVersionDetail }
  | { ok: false; error: string };

// ---- Email acta report (advisor only) ----

export type EmailReportResult =
  | { ok: true; to: string; filename: string }
  | { ok: false; error: string };

export async function sendReportByEmailAction(
  submissionId: string,
  to: string,
  message: string | null,
  reportType?: ReportType,
): Promise<EmailReportResult> {
  const trimmed = to.trim();
  if (!trimmed) {
    return { ok: false, error: "Ingresá un correo destinatario" };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return { ok: false, error: "El correo no es válido" };
  }
  try {
    const body: Record<string, unknown> = {
      to: trimmed,
      message: message?.trim() || null,
    };
    if (reportType !== undefined) {
      body.report_type = reportType;
    }
    const res = await apiFetch<{ ok: true; to: string; filename: string }>(
      `/api/v1/submissions/${submissionId}/email-report`,
      { method: "POST", body },
    );
    return { ok: true, to: res.to, filename: res.filename };
  } catch (err) {
    return {
      ok: false,
      error: extractErrorMessage(err, "No se pudo enviar el correo"),
    };
  }
}

export async function uploadVersionAction(
  submissionId: string,
  _prev: UploadVersionResult | null,
  formData: FormData,
): Promise<UploadVersionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo Word o PDF" };
  }
  if (file.size > MAX_VERSION_FILE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `El archivo pesa ${sizeMb} MB y el máximo permitido es 5 MB.`,
    };
  }
  const nameLower = file.name.toLowerCase();
  const extOk = nameLower.endsWith(".docx") || nameLower.endsWith(".pdf");
  const mimeOk = file.type === "" ? extOk : ACCEPTED_VERSION_MIME.has(file.type);
  if (!extOk || !mimeOk) {
    return {
      ok: false,
      error: "Formato no soportado. Subí un archivo .docx o .pdf.",
    };
  }
  try {
    // Normalise enable_copyleaks: HTML checkbox only sends the field when checked.
    // Absent field or any value other than "on"/"true" means the user disabled it.
    const rawCopyleaks = formData.get("enable_copyleaks");
    const enableCopyleaks =
      rawCopyleaks === "on" || rawCopyleaks === "true" ? "true" : "false";
    formData.set("enable_copyleaks", enableCopyleaks);

    const version = await apiFetch<SubmissionVersionDetail>(
      `/api/v1/submissions/${submissionId}/versions`,
      { method: "POST", formData },
    );
    revalidatePath("/student/submissions");
    revalidatePath(`/student/submissions/${submissionId}`);
    return { ok: true, version };
  } catch (err) {
    return {
      ok: false,
      error: extractErrorMessage(err, "No se pudo subir la versión"),
    };
  }
}
