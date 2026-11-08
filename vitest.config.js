import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    silent: "passed-only",
    env: {
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret-test-secret-test-secret-1234",
    },
    globalSetup: ["./tests/global-setup.ts"],
  },
});
