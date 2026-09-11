import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["src/test/setup-db.ts"],
    testTimeout: 20000,
  },
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "src") },
  },
});
