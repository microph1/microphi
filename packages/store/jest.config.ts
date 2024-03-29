import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from '../../tsconfig.json';
import { defaults as tsjPreset } from 'ts-jest/presets';
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'store',
  transform: {
    ...tsjPreset.transform,
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
  coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 87.91,
      branches: 81.82,
      functions: 78.79,
      lines: 87.50,
    }
  },

};

export default config;
