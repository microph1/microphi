import type { Config } from 'jest';


const config: Config = {
  displayName: 'socket.io-rpc',
  // testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  coverageDirectory: '<rootDir>/../../coverage/socket.io-rpc',
  coverageReporters: ['json', 'lcov', 'text-summary'],
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
