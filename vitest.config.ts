import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/data/**", "src/**/*.d.ts"],
      thresholds: {
        branches: 95,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    include: ["tests/**/*.test.ts"],
    testTimeout: 15_000,
  },
});
