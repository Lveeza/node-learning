import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    silent: "passed-only",
    env: { DATABASE_URL: "file:./test.db" },
    globalSetup: ["./tests/global-setup.ts"],
  },
});
