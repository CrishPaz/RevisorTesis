"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    }

    return (
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={cn(
          "peer h-5 w-9 cursor-pointer appearance-none rounded-full",
          "bg-zinc-300 transition-colors checked:bg-zinc-900",
          "dark:bg-zinc-600 dark:checked:bg-zinc-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
          "relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4",
          "before:rounded-full before:bg-white before:transition-transform",
          "checked:before:translate-x-4",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
