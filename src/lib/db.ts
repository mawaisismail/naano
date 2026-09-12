import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { pgConnection } from "@/lib/database-ssl";

/**
 * The Prisma client, bound to Postgres through the pg driver adapter.
 *
 * Prisma 7 takes the connection through an adapter rather than a URL in the
 * schema. There is exactly one adapter here on purpose: a second provider
 * means the engine the tests run against is not the engine that serves
 * production, and the differences surface as production-only bugs.
 */
const makeClient = () =>
  new PrismaClient({
    // Managed Postgres requires TLS; see database-ssl.ts for why the CA
    // matters, and why sslmode has to come out of the URL when it is used.
    adapter: new PrismaPg(pgConnection(resolveDatabaseUrl())),
  });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? makeClient();

// Next dev reloads modules on every edit; without this the process leaks a new
// connection pool per reload until the driver starts refusing handles.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
