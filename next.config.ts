import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module and is only used for local development.
  // Leaving it external stops Next from trying to bundle its .node binary into
  // the serverless output, where it would either bloat the function or fail to
  // load. @prisma/client must stay external for its query engine to resolve.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
};

export default nextConfig;
