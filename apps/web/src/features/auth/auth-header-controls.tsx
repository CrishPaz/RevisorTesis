"use client";

import { LanguageToggle } from "@/features/dashboard/language-toggle";
import { ThemeToggle } from "@/features/dashboard/theme-toggle";

export function AuthHeaderControls() {
  return (
    <div className="grid w-44 grid-cols-2 gap-2 sm:w-52">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}
