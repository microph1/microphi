import type { Config } from 'jest';


const config: Config = {
  displayName: 'web-socket-server',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  coverageDirectory: '<rootDir>/../../coverage/debug',
  coverageReporters: ['json', 'lcov', 'text-summary', 'html'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 88.89,
      branches: 57.14,
      functions: 100,
      lines: 88.89,
    }
  },
};


export default config;
