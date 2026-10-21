import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'store',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/store',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 91,
        branches: 94,
        functions: 92,
        lines: 91,
      },
    },
  },
});
