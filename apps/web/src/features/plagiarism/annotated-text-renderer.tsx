import type { SpanItem } from "@/lib/api/types";

function similarityClass(similarity: number): string {
  if (similarity >= 0.85) {
    return "bg-red-200 dark:bg-red-900/40";
  }
  if (similarity >= 0.5) {
    return "bg-orange-200 dark:bg-orange-900/40";
  }
  return "bg-yellow-100 dark:bg-yellow-900/30";
}

type Segment =
  | { kind: "plain"; text: string }
  | { kind: "marked"; text: string; span: SpanItem };

function buildSegments(text: string, spans: SpanItem[]): Segment[] {
  if (spans.length === 0) {
    return [{ kind: "plain", text }];
  }

  // Sort spans by start offset; resolve overlaps by taking the earlier/longer span.
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: Segment[] = [];
  let cursor = 0;

  for (const span of sorted) {
    const start = Math.max(span.start, cursor);
    if (start >= span.end) continue;

    if (start > cursor) {
      segments.push({ kind: "plain", text: text.slice(cursor, start) });
    }
    segments.push({
      kind: "marked",
      text: text.slice(start, span.end),
      span,
    });
    cursor = span.end;
  }

  if (cursor < text.length) {
    segments.push({ kind: "plain", text: text.slice(cursor) });
  }

  return segments;
}

/**
 * Normaliza el texto del PDF sin desplazar los offsets de los spans.
 * \n → espacio (1 char → 1 char): los índices de SpanItem permanecen válidos.
 * Secuencias de 3+ newlines se convierten en doble espacio para separar secciones.
 */
function normalizeDocText(raw: string): string {
  return raw
    .replace(/\n{3,}/g, (match) => " ".repeat(match.length))
    .replace(/\n/g, " ");
}

export function AnnotatedTextRenderer({
  text,
  spans,
}: {
  text: string;
  spans: SpanItem[];
}) {
  const normalized = normalizeDocText(text);
  const segments = buildSegments(normalized, spans);

  return (
    <p className="wrap-break-word text-sm leading-relaxed text-zinc-800 dark:text-(--aurora-cream-dim)">
      {segments.map((seg, i) => {
        if (seg.kind === "plain") {
          return <span key={i}>{seg.text}</span>;
        }
        const { span } = seg;
        const pageLabel = span.page_number !== null ? `pág. ${span.page_number}` : "pág. —";
        const tooltipTitle = `${(span.similarity * 100).toFixed(1)}% — ${pageLabel}`;

        return (
          <span key={i} className="inline">
            <mark
              className={`rounded px-0.5 ${similarityClass(span.similarity)}`}
              title={tooltipTitle}
            >
              {seg.text}
            </mark>
            {span.source_url ? (
              <a
                href={span.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-0.5 text-xs text-blue-600 underline dark:text-blue-400"
                title={span.source_url}
              >
                ↗
              </a>
            ) : null}
          </span>
        );
      })}
    </p>
  );
}
