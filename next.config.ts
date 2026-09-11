import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @prisma/client must stay external for its query engine to resolve, and the
  // pg adapter with it.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
