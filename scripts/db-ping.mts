import "dotenv/config";
import { Client } from "pg";
import { pgConnection } from "../src/lib/database-ssl";
import { resolveDatabaseUrl } from "../src/lib/database-url";

/** Connects once and reports what the server actually is. */
const client = new Client(pgConnection(resolveDatabaseUrl()));
await client.connect();
const { rows } = await client.query(
  "select current_database() as db, current_user as usr, version() as v, " +
    "(select count(*) from pg_stat_ssl where pid = pg_backend_pid() and ssl) as tls"
);
console.log(`database: ${rows[0].db}  user: ${rows[0].usr}`);
console.log(`tls:      ${rows[0].tls === "1" || rows[0].tls === 1 ? "on, certificate verified" : "OFF"}`);
console.log(`server:   ${String(rows[0].v).split(" ").slice(0, 2).join(" ")}`);
await client.end();
