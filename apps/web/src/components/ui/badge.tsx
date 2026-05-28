import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: cn(
          "border-transparent bg-zinc-900 text-zinc-50",
          "dark:border-[color:rgba(125,211,252,0.25)] dark:bg-[rgba(14,165,233,0.25)] dark:text-[color:var(--aurora-cream)]",
        ),
        outline: cn(
          "text-zinc-950 border-zinc-200",
          "dark:border-[color:rgba(125,211,252,0.3)] dark:text-[color:var(--aurora-cream)]",
        ),
        success: cn(
          "border-transparent bg-emerald-100 text-emerald-700",
          "dark:bg-emerald-500/15 dark:text-emerald-300",
        ),
        warning: cn(
          "border-transparent bg-amber-100 text-amber-800",
          "dark:bg-amber-500/15 dark:text-amber-300",
        ),
        destructive: cn(
          "border-transparent bg-rose-100 text-rose-700",
          "dark:bg-rose-500/15 dark:text-rose-300",
        ),
        muted: cn(
          "border-transparent bg-zinc-100 text-zinc-700",
          "dark:border-[color:rgba(125,211,252,0.12)] dark:bg-[rgba(6,18,31,0.7)] dark:text-[color:var(--aurora-cream-dim)]",
        ),
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
