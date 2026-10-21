import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'di',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/di',
      reporter: ['json', 'lcov', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.experiment.ts', 'src/**/index.ts'],
      thresholds: {
        statements: 90,
        branches: 82,
        functions: 91,
        lines: 90,
      },
    },
  },
});
