"use server";

import { revalidatePath, updateTag } from "next/cache";

import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { Program, ProgramLevel } from "@/lib/api/types";

// Programs are the same for every authenticated user (admin-only CRUD). The
// Next fetch cache keys by URL+method+tags (not Authorization header), so the
// response is safely shared across users. Mutations call updateTag("programs").
export async function fetchPrograms(): Promise<Program[]> {
  return apiFetch<Program[]>("/api/v1/programs", {
    cache: "force-cache",
    next: { tags: ["programs"], revalidate: 300 },
  });
}

export type CreateProgramResult =
  | { ok: true; program: Program }
  | { ok: false; error: string };

export async function createProgramAction(
  _prev: CreateProgramResult | null,
  formData: FormData,
): Promise<CreateProgramResult> {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const level = String(formData.get("level") ?? "masters") as ProgramLevel;
  if (!name || !code) {
    return { ok: false, error: "Nombre y código son requeridos" };
  }
  try {
    const program = await apiFetch<Program>("/api/v1/programs", {
      method: "POST",
      body: { name, code, level },
    });
    updateTag("programs");
    revalidatePath("/admin/programs");
    revalidatePath("/coordinator/templates");
    return { ok: true, program };
  } catch (err) {
    return {
      ok: false,
      error: extractErrorMessage(err, "No se pudo crear el programa"),
    };
  }
}

export async function deleteProgramAction(programId: string): Promise<void> {
  await apiFetch(`/api/v1/programs/${programId}`, { method: "DELETE" });
  updateTag("programs");
  revalidatePath("/admin/programs");
}
