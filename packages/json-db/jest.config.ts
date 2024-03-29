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
      statements: 92.12,
      branches: 73.53,
      functions: 93.75,
      lines: 93.71,
    }
  },
};


export default config;
