import type { Config } from 'jest';

const config: Config = {
  displayName: 'di',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    '\\.js$': ['babel-jest', {rootMode: 'upward'}],
    // [...]
  },
  // moduleNameMapper,
  coverageDirectory: '<rootDir>/../../coverage/di',
  coverageReporters: ['json', 'lcov', 'text-summary', 'html'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 91,
      branches: 78,
      functions: 92,
      lines: 91,
    }
  },
};


export default config;
