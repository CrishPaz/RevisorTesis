"use client";

import { useState, useTransition } from "react";

import { OrcidLinkedBadge } from "@/features/orcid/orcid-ui";
import { Label } from "@/components/ui/label";
import {
  unlinkStudentOrcidAction,
  validateStudentOrcidAction,
} from "@/lib/api/orcid";
import type { OrcidStudentStatus } from "@/lib/api/types";

type Props = {
  initial: OrcidStudentStatus;
};

export function StudentOrcidForm({ initial }: Props) {
  const [status, setStatus] = useState<OrcidStudentStatus>(initial);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onValidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await validateStudentOrcidAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(result.data);
      setDraft("");
    });
  }

  function onUnlink() {
    if (
      !confirm(
        "¿Desvincular tu ORCID? Se eliminarán las publicaciones sincronizadas.",
      )
    ) {
      return;
    }
    start(async () => {
      await unlinkStudentOrcidAction();
      setStatus({
        ...status,
        linked: false,
        orcid_id: null,
        full_name: null,
        affiliation: null,
        last_sync: null,
        publications_count: 0,
      });
    });
  }

  if (status.linked) {
    return (
      <div className="space-y-4 border-t border-[color:var(--orcid-pub-border)] pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <OrcidLinkedBadge />
          {status.mode === "stub" ? (
            <span className="orcid-year-badge" title="Modo desarrollo sin credenciales reales">
              modo demo
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="orcid-btn-outline"
          onClick={onUnlink}
          disabled={pending}
        >
          {pending ? "Desvinculando…" : "Desvincular ORCID"}
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onValidate}>
      <div className="space-y-1.5">
        <Label htmlFor="orcid-id" className="text-[color:var(--orcid-text)]">
          ORCID iD
        </Label>
        <input
          id="orcid-id"
          name="orcid_id"
          className="orcid-input"
          placeholder="0000-0000-0000-000X"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
          inputMode="text"
          maxLength={19}
          disabled={pending}
          required
        />
        <p className="text-xs text-[color:var(--orcid-muted)]">
          Formato esperado: 4 grupos de 4 dígitos separados por guiones. El último
          carácter puede ser un dígito o la letra X.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <button
        type="submit"
        className="orcid-btn-primary"
        disabled={pending || !draft.trim()}
      >
        {pending ? "Validando…" : "Validar ORCID"}
      </button>
    </form>
  );
}
