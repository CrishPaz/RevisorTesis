import * as React from "react";

import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-[color:rgba(125,211,252,0.22)] dark:bg-[rgba(6,18,31,0.6)] dark:text-[color:var(--aurora-cream)] dark:placeholder:text-[color:rgba(180,206,224,0.45)] dark:focus-visible:border-[color:rgba(56,189,248,0.8)] dark:focus-visible:ring-sky-500/40 dark:focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
