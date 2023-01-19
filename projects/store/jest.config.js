const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: `${__dirname}/../../` });

module.exports = {
  displayName: 'store',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper,
  coverageReporters: ['text'],
  // test reporter does not create a coverage folder
  // in any other case create it under global coverage
  coverageDirectory: '../../coverage/_store',

  coverageThreshold: {
    global: {
      statements: 89,
      branches: 72,
      lines: 89,
      functions: 85,
    }
  }
};
