import type { Config } from 'jest';

const config: Config = {
  displayName: 'json-db',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    '\\.js$': ['babel-jest', {rootMode: 'upward'}],
  },
  coverageDirectory: '<rootDir>/../../coverage/json-db',
  coverageReporters: ['json', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90.09,
      branches: 73.07,
      functions: 90.00,
      lines: 92.52,
    }
  },
};


export default config;
