import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    silent: "passed-only",
    env: {
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret-test-secret-test-secret-1234",
      API_RATE_LIMIT: "100000",
      AUTH_RATE_LIMIT: "100000",
      CORS_ORIGINS: "http://localhost:5173",
      LOG_LEVEL: "silent",
    },
    globalSetup: ["./tests/global-setup.ts"],
  },
});
