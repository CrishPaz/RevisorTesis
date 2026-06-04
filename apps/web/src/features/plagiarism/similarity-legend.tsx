import { getMessages } from "@/lib/i18n/server";

export async function SimilarityLegend() {
  const { t } = await getMessages();

  const items = [
    {
      label: t("viewer.legend.high"),
      className: "bg-red-200 dark:bg-red-900/40",
    },
    {
      label: t("viewer.legend.medium"),
      className: "bg-orange-200 dark:bg-orange-900/40",
    },
    {
      label: t("viewer.legend.low"),
      className: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ] as const;

  return (
    <div className="hidden items-center gap-3 text-xs text-zinc-500 sm:flex dark:text-[color:var(--aurora-cream-dim)]">
      {items.map(({ label, className }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`size-2.5 rounded-sm ${className}`} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
