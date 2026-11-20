import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'sql',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/sql',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 95,
        branches: 85,
        functions: 95,
        lines: 95,
      },
    },
  },
});
