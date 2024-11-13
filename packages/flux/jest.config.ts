import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'flux',
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
  testEnvironment: 'jsdom',
  moduleNameMapper,
  coverageDirectory: '<rootDir>/../../coverage/flux',
  coverageReporters: ['json','lcov', 'text-summary', 'html'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 72,
      branches: 60,
      lines: 72,
      functions: 68,
    }
  },
};


export default config;
