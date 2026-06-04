"use client";

import { useTransition } from "react";

import {
  startOrcidLinkAction,
  unlinkOrcidAction,
} from "@/lib/api/orcid";

const STATE_COOKIE = "kimy.orcid.state";

function writeStateCookie(state: string) {
  const maxAge = 10 * 60;
  document.cookie = `${STATE_COOKIE}=${encodeURIComponent(state)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function LinkOrcidButton({ linked }: { linked: boolean }) {
  const [pending, start] = useTransition();

  function onLink() {
    start(async () => {
      const result = await startOrcidLinkAction();
      if (!result.ok) {
        alert(result.error);
        return;
      }
      writeStateCookie(result.data.state);
      window.location.href = result.data.authorize_url;
    });
  }

  function onUnlink() {
    if (!confirm("¿Desvincular tu cuenta de ORCID? Se eliminarán las publicaciones sincronizadas.")) return;
    start(async () => {
      await unlinkOrcidAction();
      window.location.reload();
    });
  }

  if (linked) {
    return (
      <button
        type="button"
        className="orcid-btn-outline"
        onClick={onUnlink}
        disabled={pending}
      >
        {pending ? "Desvinculando…" : "Desvincular ORCID"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="orcid-btn-primary"
      onClick={onLink}
      disabled={pending}
    >
      {pending ? "Redirigiendo…" : "Vincular con ORCID"}
    </button>
  );
}
