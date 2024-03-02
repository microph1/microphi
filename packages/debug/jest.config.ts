import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from '../../tsconfig.json';
import { defaults as tsjPreset } from 'ts-jest/presets'
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'debug',
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
  coverageDirectory: '<rootDir>/../../coverage/debug',
  coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    "**/src/**/!(*.spec).ts",
    "!**/*.experiment.ts",
    "!**/index.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 13.89,
      branches: 7.14,
      functions: 33.33,
      lines: 13.89,
    }
  },
}


export default config;
