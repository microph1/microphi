const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: `${__dirname}/../../` });

module.exports = {
  displayName: 'marbles',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper,
  coverageReporters: ['text'],
  // test reporter does not create a coverage folder
  // in any other case create it under global coverage
  coverageDirectory: '../../coverage/_marbles',
  coverageThreshold: {
    global: {
      statements: 87.4,
      branches: 99,
      lines: 87.4,
      functions: 72.6,
    }
  }
};
