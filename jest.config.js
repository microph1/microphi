
module.exports = {

  projects: [
    // libs
    '<rootDir>/projects/store/src',
    '<rootDir>/projects/test/src',
    '<rootDir>/projects/phi/src',
    '<rootDir>/projects/flux/**/src',

    // apps
    '<rootDir>/apps/**/src',

  ],
  coverageDirectory: 'coverage',
  reporters: [
    'default'
  ],
  coverageReporters: [
    'html',
    'lcov',
    'text'
  ],
  collectCoverageFrom: [
    "**/src/**/!(*.spec).ts",
    "!**/index.ts",
    "!**/*.module.ts",
    "!**/polyfills.ts",
    "!**/src/environments/**",
    "!**/main.ts",
    "!**/src/public-api.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 76,
      branches: 65,
      lines: 75,
      functions: 68,
    }
  },

};
