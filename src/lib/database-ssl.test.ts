import { describe, expect, it } from "vitest";
import { databaseSsl, pgConnection, withoutSslMode } from "./database-ssl";

const PEM = "-----BEGIN CERTIFICATE-----\nMIIE\n-----END CERTIFICATE-----";

describe("databaseSsl", () => {
  it("verifies the chain when a CA is configured", () => {
    const ssl = databaseSsl({ DATABASE_CA_CERT: PEM });
    expect(ssl?.rejectUnauthorized).toBe(true);
    expect(ssl?.ca).toBe(PEM);
  });

  it("accepts a PEM whose newlines survived as backslash-n", () => {
    const ssl = databaseSsl({ DATABASE_CA_CERT: PEM.replace(/\n/g, "\\n") });
    expect(ssl?.ca).toBe(PEM);
  });

  it("stays out of the way when no CA is set", () => {
    expect(databaseSsl({})).toBeUndefined();
    expect(databaseSsl({ DATABASE_CA_CERT: "  " })).toBeUndefined();
  });

  it("never turns verification off", () => {
    // The tempting fix for a self-signed chain is rejectUnauthorized:false.
    // That is worse than no TLS at all, because it looks secure.
    const ssl = databaseSsl({ DATABASE_CA_CERT: PEM });
    expect(ssl).not.toHaveProperty("rejectUnauthorized", false);
  });
});

describe("withoutSslMode", () => {
  it("removes sslmode so the explicit CA is not silently discarded", () => {
    const url = withoutSslMode("postgres://u:p@h:5432/db?sslmode=require&application_name=x");
    expect(url).not.toContain("sslmode");
    expect(url).toContain("application_name=x");
  });

  it("leaves an unparseable string alone", () => {
    expect(withoutSslMode("not a url")).toBe("not a url");
  });
});

describe("pgConnection", () => {
  it("strips sslmode only when a CA is in play", () => {
    const withCa = pgConnection("postgres://u:p@h/db?sslmode=require", { DATABASE_CA_CERT: PEM });
    expect(withCa.connectionString).not.toContain("sslmode");
    expect(withCa.ssl?.rejectUnauthorized).toBe(true);

    const plain = pgConnection("postgres://u:p@h/db?sslmode=require", {});
    expect(plain.connectionString).toContain("sslmode=require");
    expect(plain.ssl).toBeUndefined();
  });
});

describe("pool sizing", () => {
  it("stays small on serverless, where every instance opens its own pool", () => {
    // 20 connections on the plan: at the pg default of 10, two warm instances
    // use the lot and the next request looks like a database outage.
    expect(pgConnection("postgres://u:p@h/db", { VERCEL: "1" }).max).toBeLessThanOrEqual(5);
  });

  it("stays inside a shared plan off serverless too", () => {
    // The whole plan is 20 connections and local work shares it with the
    // deployed site, so "not serverless" is not a licence to take ten.
    const max = pgConnection("postgres://u:p@h/db", {}).max;
    expect(max).toBeGreaterThan(1);
    expect(max).toBeLessThanOrEqual(5);
  });

  it("honours an explicit override", () => {
    expect(pgConnection("postgres://u:p@h/db", { DATABASE_POOL_MAX: "2" }).max).toBe(2);
    // Nonsense values fall back rather than producing a pool of NaN.
    expect(pgConnection("postgres://u:p@h/db", { DATABASE_POOL_MAX: "x" }).max).toBe(4);
  });
});
