import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** True when globalSetup provisioned a throwaway Postgres schema. */
export const hasTestDb = () => Boolean(process.env.TEST_SCHEMA_URL);

/** Client bound to the throwaway test schema, never a real one. */
export function testClient() {
  const url = process.env.TEST_SCHEMA_URL;
  if (!url) throw new Error("TEST_SCHEMA_URL missing — globalSetup did not run");
  // The guard is the point: a mistyped URL must not let a test suite run
  // DELETE against production data.
  if (!/[?&]schema=naano_test_/.test(url)) {
    throw new Error(`refusing to run tests against a non-test schema: ${url}`);
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}
