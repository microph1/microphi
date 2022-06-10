
module.exports = {
  projects: [
    // libs
    '<rootDir>/projects/store/src',
    '<rootDir>/projects/test/src',
    '<rootDir>/projects/phi/src',

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
    "!**/src/public-api.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    }
  },

};
