import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'json-db',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/json-db',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 89,
        branches: 63,
        functions: 93,
        lines: 92,
      },
    },
  },
});
