import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
// import { compilerOptions } from '../../tsconfig.json';
import { defaults as tsjPreset } from 'ts-jest/presets'
const { compilerOptions } = require('../../tsconfig.json');

// const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../'});

const config: Config = {
  displayName: 'di',
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
  coverageDirectory: '<rootDir>/../../coverage/di',
  coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    "**/src/**/!(*.spec).ts",
    "!**/*.experiment.ts",
    "!**/index.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 92.33,
      branches: 78.79,
      functions: 92.39,
      lines: 92.22,
    }
  },
}


export default config;
