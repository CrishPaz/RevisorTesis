import { enAuthForms } from "./messages/auth-forms";
import { esAuthForms } from "./messages/auth-forms";
import { enDashboard, esDashboard } from "./messages/dashboard";
import { en as enBase } from "./messages/en";
import { es as esBase } from "./messages/es";
import { enPanels, esPanels } from "./messages/panels";
import { enSubmissions, esSubmissions } from "./messages/submissions";

export type Locale = "es" | "en";
export const LOCALES: readonly Locale[] = ["es", "en"] as const;
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "tesis-locale";

// Merge base + per-block dictionaries. Each block lives in its own file so
// parallel agents working on different blocks don't collide on writes.
const es = {
  ...esBase,
  ...esDashboard,
  ...esSubmissions,
  ...esAuthForms,
  ...esPanels,
} as const;

const en: Record<keyof typeof es, string> = {
  ...enBase,
  ...enDashboard,
  ...enSubmissions,
  ...enAuthForms,
  ...enPanels,
};

export type MessageKey = keyof typeof es;
export type Messages = Record<MessageKey, string>;

const DICTIONARIES: Record<Locale, Messages> = {
  es: es as Messages,
  en,
};

export function getMessagesFor(locale: Locale): Messages {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

// Replaces {name} {count} placeholders with the values passed in.
export function format(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in values ? String(values[k]) : `{${k}}`,
  );
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "es" || value === "en";
}
