import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'list',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/list',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 96,
        branches: 84,
        functions: 100,
        lines: 96,
      },
    },
  },
});
