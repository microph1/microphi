const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.json');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: `${__dirname}/../../` });

module.exports = {
  displayName: 'marbles',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper,
  "transform": {
    "^.+\\.ts?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(spec))\\.ts?$",
  "moduleFileExtensions": [
    "ts",
    "js"
  ]
};
