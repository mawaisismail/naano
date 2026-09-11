import { PrismaClient } from "@prisma/client";
import { makeAdapter } from "@/lib/adapter";
import { resolveDatabaseUrl } from "@/lib/database-url";

/**
 * Prisma 7 takes the connection through a driver adapter rather than a URL in
 * the schema, so the driver is chosen from the URL scheme:
 *
 *   file:./dev.db                     -> SQLite   (local development)
 *   postgres://... | postgresql://... -> Postgres (deployed)
 *
 * SQLite cannot run on Vercel — serverless filesystems are read-only and
 * ephemeral, so the click history would vanish between invocations and the
 * attribution demo would break.
 */
const url = resolveDatabaseUrl();

const makeClient = () => new PrismaClient({ adapter: makeAdapter(url) });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next dev reloads modules on every edit; without this the process leaks a new
// connection pool per reload until the driver starts refusing handles.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
