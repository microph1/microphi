import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'endpoint',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/endpoint',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 93,
        branches: 68,
        functions: 97,
        lines: 93,
      },
    },
  },
});
