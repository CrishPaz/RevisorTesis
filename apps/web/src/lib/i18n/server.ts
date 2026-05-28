import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  format,
  getMessagesFor,
  isLocale,
  type Locale,
  type MessageKey,
  type Messages,
} from "./index";

// `cache()` is not strictly necessary — cookies() is already memoized per
// request — but reading the cookie is cheap so we keep it lean.
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getMessages(): Promise<{
  locale: Locale;
  messages: Messages;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}> {
  const locale = await getLocale();
  const messages = getMessagesFor(locale);
  const t = (key: MessageKey, values?: Record<string, string | number>) =>
    format(messages[key] ?? key, values);
  return { locale, messages, t };
}
