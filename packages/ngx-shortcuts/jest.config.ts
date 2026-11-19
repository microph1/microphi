import type { Config } from 'jest';

const config: Config = {
  displayName: 'ngx-shortcuts',
  preset: 'jest-preset-angular',
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' },
    ],
  },
  moduleNameMapper: {
    '^@microphi/ngx-shortcuts$': '<rootDir>/src/public-api.ts',
    '^@microphi/ngx-shortcuts/testing$': '<rootDir>/testing/src/public-api.ts',
  },
  // dist/ holds a package.json with the same name: keep it out of the haste map
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  coverageDirectory: '<rootDir>/../../coverage/ngx-shortcuts',
  coverageReporters: ['json', 'lcov', 'text-summary', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'testing/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/public-api.ts',
    '!src/test-setup.ts',
  ],
  coverageThreshold: {
    global: { statements: 90, branches: 85, lines: 90, functions: 90 },
  },
};

export default config;
