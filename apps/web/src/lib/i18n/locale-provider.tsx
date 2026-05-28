"use client";

import { createContext, useContext, useMemo } from "react";

import {
  format,
  type Locale,
  type MessageKey,
  type Messages,
} from "./index";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: Locale;
  initialMessages: Messages;
  children: React.ReactNode;
}) {
  // No client-side switching state: the server action revalidates the route
  // after setting the cookie, so the provider is always re-mounted with the
  // fresh locale on next render. Keeping the value memoized avoids spurious
  // re-renders of every consumer.
  const value = useMemo<LocaleContextValue>(() => {
    const t = (key: MessageKey, values?: Record<string, string | number>) =>
      format(initialMessages[key] ?? key, values);
    return { locale: initialLocale, messages: initialMessages, t };
  }, [initialLocale, initialMessages]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within <LocaleProvider>");
  }
  return ctx;
}

// Hook sugar: returns just the translation function.
export function useTranslations(): LocaleContextValue["t"] {
  return useLocale().t;
}

// Helper hook for components that need to know the current locale code.
export function useCurrentLocale(): Locale {
  return useLocale().locale;
}

// Re-export the type so consumers can import from one place.
export type { Locale } from "./index";
