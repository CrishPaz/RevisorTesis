// Copyleaks / plagiarism viewer block.
// Keys MUST use the `copyleaks.` or `viewer.` prefix.

export const esCopyleaks = {
  "copyleaks.toggleLabel": "Verificar similitud (Copyleaks)",
  "copyleaks.privacyWarning":
    "Al activar esta opción, el PDF será enviado al servicio externo Copyleaks para su análisis.",
  "copyleaks.noMatches": "Sin coincidencias externas detectadas",
  "copyleaks.accessDenied": "No tiene acceso a esta submission",
  "viewer.title": "Reporte de similitud",
  "viewer.accessDenied.title": "Acceso denegado",
  "viewer.accessDenied": "No tiene acceso a esta submission",
  "viewer.annotatedText.title": "Texto del documento",
  "submission.similarity.processing": "Procesando…",
  "submission.similarity.error": "Error",
} as const;

export const enCopyleaks: Record<keyof typeof esCopyleaks, string> = {
  "copyleaks.toggleLabel": "Verify similarity (Copyleaks)",
  "copyleaks.privacyWarning":
    "By enabling this option, the PDF will be sent to the external Copyleaks service for analysis.",
  "copyleaks.noMatches": "No external matches detected",
  "copyleaks.accessDenied": "You do not have access to this submission",
  "viewer.title": "Similarity report",
  "viewer.accessDenied.title": "Access denied",
  "viewer.accessDenied": "You do not have access to this submission",
  "viewer.annotatedText.title": "Document text",
  "submission.similarity.processing": "Processing…",
  "submission.similarity.error": "Error",
};
