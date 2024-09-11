import type { Config } from 'jest';

const config: Config = {
  displayName: 'list',
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
  // coverageDirectory: '<rootDir>/../../coverage/list',
  //coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 94.30,
      branches: 75,
      functions: 100,
      lines: 96.15,
    }
  },
};


export default config;
