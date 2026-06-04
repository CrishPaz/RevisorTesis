import type { ReactNode } from "react";

import type { OrcidPublication } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export function OrcidLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z"
      />
      <g fill="#FFFFFF">
        <path d="M86.3,186.2H70.9V79.1h15.4v107.1H86.3z" />
        <path d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.1h24.5c34.9,0,42.9-26.5,42.9-39.6c0-21.6-13.9-45.8-43.2-45.8h-24.1V172.1z" />
      </g>
    </svg>
  );
}

export function OrcidPage({ children }: { children: ReactNode }) {
  return <div className="orcid-page space-y-6">{children}</div>;
}

type OrcidHeroProps = {
  role: string;
  title: string;
  subtitle: string;
};

export function OrcidHero({ role, title, subtitle }: OrcidHeroProps) {
  return (
    <header className="orcid-hero">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 text-[color:var(--orcid-green)]">
          <OrcidLogo />
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="orcid-role">{role}</p>
          <h1 className="orcid-title">{title}</h1>
          <p className="orcid-subtitle">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

export function OrcidCard({
  children,
  className,
  accent = true,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section className={cn("orcid-card", accent && "orcid-card-accent", className)}>
      {children}
    </section>
  );
}

export function OrcidCardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[color:var(--orcid-pub-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="orcid-section-title">{title}</h2>
        {description ? (
          <p className="orcid-section-desc">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function OrcidCardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function OrcidLinkedBadge({ label = "Vinculado" }: { label?: string }) {
  return (
    <span className="orcid-badge-linked">
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-[color:var(--orcid-green)]"
      />
      {label}
    </span>
  );
}

export function OrcidIdLink({ orcidId }: { orcidId: string }) {
  return (
    <a
      href={`https://orcid.org/${orcidId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="orcid-id-link inline-flex items-center gap-1.5"
    >
      <OrcidLogo className="size-4 text-[color:var(--orcid-green)]" />
      {orcidId}
    </a>
  );
}

type DataField = { label: string; value: ReactNode };

export function OrcidDataGrid({ fields }: { fields: DataField[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {fields.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-1 gap-0.5 sm:contents">
          <dt className="orcid-data-dt">{label}</dt>
          <dd className="orcid-data-dd">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OrcidPublicationList({
  publications,
  emptyLinked,
  emptyNotLinked,
  linked,
}: {
  publications: OrcidPublication[];
  emptyLinked: string;
  emptyNotLinked: string;
  linked: boolean;
}) {
  if (publications.length === 0) {
    return (
      <p className="orcid-empty">
        {linked ? emptyLinked : emptyNotLinked}
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {publications.map((p) => (
        <li key={p.id} className="orcid-pub-item text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            {p.year ? <span className="orcid-year-badge">{p.year}</span> : null}
            {p.doi ? (
              <a
                href={`https://doi.org/${p.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[color:var(--orcid-green-dark)] hover:text-[color:var(--orcid-green)] hover:underline dark:text-[color:var(--orcid-green)]"
              >
                {p.doi}
              </a>
            ) : null}
          </div>
          <p className="mt-1.5 font-medium leading-snug text-[color:var(--orcid-text)]">
            {p.title}
          </p>
          {p.journal ? (
            <p className="mt-0.5 text-xs italic text-[color:var(--orcid-muted)]">
              {p.journal}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
