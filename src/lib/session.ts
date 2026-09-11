import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const SESSION_COOKIE = "naano_session";

export async function getCurrentUser() {
  const jar = await cookies();
  const id = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function requireBrand() {
  const user = await getCurrentUser();
  return user && user.role === "brand" ? user : null;
}

export async function requireCreator() {
  const user = await getCurrentUser();
  return user && user.role === "creator" ? user : null;
}
