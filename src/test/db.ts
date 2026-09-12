import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pgConnection } from "@/lib/database-ssl";

/** True when globalSetup provisioned a throwaway Postgres schema. */
export const hasTestDb = () => Boolean(process.env.TEST_SCHEMA_URL);

/**
 * Client bound to the throwaway test schema, never a real one.
 *
 * The `?schema=` parameter in the URL is understood by the Prisma CLI and the
 * query engine, but NOT by the pg driver — node-postgres ignores query
 * parameters it does not recognise and connects on the default search_path.
 * Passing the connection string alone therefore ran the whole suite against
 * `public`, which is the application's own data. The schema has to be handed
 * to the adapter explicitly, which is what the second argument is for.
 */
export function testClient() {
  const url = process.env.TEST_SCHEMA_URL;
  if (!url) throw new Error("TEST_SCHEMA_URL missing — globalSetup did not run");

  const schema = new URL(url).searchParams.get("schema") ?? "";
  // The guard is the point: a mistyped URL must not let a test suite run
  // DELETE against production data.
  if (!schema.startsWith("naano_test_")) {
    throw new Error(`refusing to run tests against a non-test schema: ${schema || "(none)"}`);
  }

  // Same TLS treatment as the app: the test database is the managed one, and
  // it refuses an unverified connection.
  return new PrismaClient({ adapter: new PrismaPg(pgConnection(url), { schema }) });
}
