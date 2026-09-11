import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const SESSION_COOKIE = "naano_session";

/**
 * The signed-in user for this request, or null.
 *
 * Wrapped in React's cache(): the (authenticated) layout, the section layout
 * and any page below them all ask for the user while rendering one request.
 * Without this that is three identical queries per navigation; with it, one.
 */
export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const id = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
});

export async function requireBrand() {
  const user = await getCurrentUser();
  return user && user.role === "brand" ? user : null;
}

export async function requireCreator() {
  const user = await getCurrentUser();
  return user && user.role === "creator" ? user : null;
}
