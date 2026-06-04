"use client";

import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import type { PageMatch } from "@/lib/api/types";

// Worker de pdf.js servido desde el bundle (metodo recomendado por react-pdf).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PAGE_WIDTH = 820;

type Severity = "high" | "med" | "low";

function severityOf(similarity: number): Severity {
  if (similarity >= 0.85) return "high";
  if (similarity >= 0.5) return "med";
  return "low";
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Visor del PDF original con los fragmentos coincidentes resaltados sobre
 * la capa de texto de pdf.js. Cada pagina arma un "haystack" normalizado con
 * los matched_text de sus matches; el customTextRenderer resalta cada item de
 * texto cuyo contenido aparezca en ese haystack.
 */
export function PdfHighlightViewer({
  fileUrl,
  matches,
}: {
  fileUrl: string;
  matches: PageMatch[];
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Memoizar el objeto file evita que react-pdf recargue el PDF en cada render.
  const file = useMemo(() => ({ url: fileUrl }), [fileUrl]);

  // Agrupar matches por numero de pagina (1-based, igual que pdf.js).
  const byPage = useMemo(() => {
    const map = new Map<number, PageMatch[]>();
    for (const m of matches) {
      if (m.page_number == null) continue;
      const arr = map.get(m.page_number) ?? [];
      arr.push(m);
      map.set(m.page_number, arr);
    }
    return map;
  }, [matches]);

  // Cantidad de matches sin pagina localizable (chunks previos al refactor).
  const orphanCount = useMemo(
    () => matches.filter((m) => m.page_number == null).length,
    [matches],
  );

  function buildTextRenderer(pageNumber: number) {
    const pageMatches = byPage.get(pageNumber) ?? [];
    if (pageMatches.length === 0) {
      return ({ str }: { str: string }) => escapeHtml(str);
    }

    const haystack = pageMatches.map((m) => normalize(m.matched_text)).join(" | ");
    const maxSeverity = pageMatches.reduce<Severity>((acc, m) => {
      const sev = severityOf(m.similarity);
      if (sev === "high") return "high";
      if (sev === "med" && acc !== "high") return "med";
      return acc;
    }, "low");

    return ({ str }: { str: string }) => {
      const norm = normalize(str);
      if (norm.length >= 3 && haystack.includes(norm)) {
        return `<mark class="cl-mark cl-${maxSeverity}">${escapeHtml(str)}</mark>`;
      }
      return escapeHtml(str);
    };
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
        No se pudo cargar el PDF para previsualizacion. {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>{`
        .cl-mark { border-radius: 2px; padding: 0 1px; color: inherit; }
        .cl-high { background: rgba(239, 68, 68, 0.45); box-shadow: 0 0 0 1px rgba(239,68,68,0.6); }
        .cl-med  { background: rgba(249, 115, 22, 0.40); box-shadow: 0 0 0 1px rgba(249,115,22,0.55); }
        .cl-low  { background: rgba(250, 204, 21, 0.40); box-shadow: 0 0 0 1px rgba(250,204,21,0.5); }
        .react-pdf__Page { margin: 0 auto 1.25rem auto; box-shadow: 0 1px 6px rgba(0,0,0,0.18); }
      `}</style>

      {orphanCount > 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {orphanCount} coincidencia(s) sin pagina localizable se muestran solo
          en el panel lateral (documento procesado antes de registrar paginas).
        </p>
      ) : null}

      <div className="max-h-[80vh] overflow-auto rounded-lg border border-zinc-200 bg-zinc-100 p-4 dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.55)]">
        <Document
          file={file}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={(e) => setError(e.message)}
          loading={
            <p className="py-8 text-center text-sm text-zinc-500">
              Cargando documento…
            </p>
          }
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
            <Page
              key={pageNumber}
              pageNumber={pageNumber}
              width={PAGE_WIDTH}
              customTextRenderer={buildTextRenderer(pageNumber)}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
