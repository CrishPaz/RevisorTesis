import type { ReactNode } from "react";

import { getMessages } from "@/lib/i18n/server";

type Props = {
  pill: ReactNode;
  title: ReactNode;
  description: ReactNode;
  highlights?: { label: ReactNode; value: ReactNode }[];
  formTitle: ReactNode;
  formDescription: ReactNode;
  formChildren: ReactNode;
  formFooter: ReactNode;
};

export async function AuthSplit({
  pill,
  title,
  description,
  highlights,
  formTitle,
  formDescription,
  formChildren,
  formFooter,
}: Props) {
  const { t } = await getMessages();
  return (
    <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <section className="space-y-8">
        <span className="aurora-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--aurora-cream)]">
          <span aria-hidden className="text-[color:var(--aurora-brass)]">
            ◆
          </span>
          {pill}
        </span>

        <h1 className="aurora-display text-5xl font-bold text-[color:var(--aurora-cream)] sm:text-6xl lg:text-[5.25rem]">
          {title}
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-[color:var(--aurora-cream-dim)] sm:text-lg">
          {description}
        </p>

        {highlights && highlights.length > 0 ? (
          <dl className="grid grid-cols-3 gap-6 border-t border-[color:rgba(125,211,252,0.18)] pt-6 max-w-xl">
            {highlights.map((h, i) => (
              <div key={i} className="space-y-1">
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--aurora-cream-dim)]">
                  {h.label}
                </dt>
                <dd className="aurora-display text-2xl font-semibold text-[color:var(--aurora-cream)]">
                  {h.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="lg:justify-self-end w-full max-w-md">
        <div className="aurora-card rounded-2xl p-6 sm:p-8">
          <div className="mb-6 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--aurora-primary-soft)]">
              {t("authForm.split.institutionalAccess")}
            </p>
            <h2 className="aurora-display text-2xl font-semibold text-[color:var(--aurora-cream)]">
              {formTitle}
            </h2>
            <p className="text-sm text-[color:var(--aurora-cream-dim)]">
              {formDescription}
            </p>
          </div>

          {formChildren}

          <div className="mt-6 border-t border-[color:rgba(125,211,252,0.15)] pt-4 text-center text-sm text-[color:var(--aurora-cream-dim)]">
            {formFooter}
          </div>
        </div>
      </section>
    </div>
  );
}
