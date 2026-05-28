"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, isLocale, type Locale } from "./index";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleAction(next: Locale): Promise<void> {
  if (!isLocale(next)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false, // readable by the client provider's boot script
  });
  // Revalidate everything so server components re-render with the new locale.
  revalidatePath("/", "layout");
}
