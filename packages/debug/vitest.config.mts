import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'debug',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/debug',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 91,
        branches: 69,
        functions: 100,
        lines: 90,
      },
    },
  },
});
