import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'store',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // ts-jest configuration goes here
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    // [...]
  },
  moduleNameMapper,
  coverageDirectory: '<rootDir>/../../coverage/store',
  coverageReporters: ['json', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 88.04,
      branches: 81.81,
      functions: 78.78,
      lines: 87.64,
    }
  },

};

export default config;
