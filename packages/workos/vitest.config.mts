import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'workos',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/workos',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/*.ts'],
      thresholds: { statements: 90, branches: 80, functions: 90, lines: 90 },
    },
  },
});
