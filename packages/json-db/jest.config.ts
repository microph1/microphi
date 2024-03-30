import type { Config } from 'jest';
// import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from '../../tsconfig.json';
import { defaults as tsjPreset } from 'ts-jest/presets';
// const { compilerOptions } = require('../../tsconfig.json');

// const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'json-db',
  transform: {
    ...tsjPreset.transform,
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
  coverageDirectory: '<rootDir>/../../coverage/json-db',
  coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    '**/src/**/!(*.spec).ts',
    '!**/*.experiment.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90.09,
      branches: 73.08,
      functions: 90.00,
      lines: 92.52,
    }
  },
};


export default config;
