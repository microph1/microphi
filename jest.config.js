


module.exports = {
  projects: [
    'projects/*'
  ],

  coverageDirectory: 'coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'coverage', outputName: 'junit.xml' }],
  ],
  coverageReporters: ['html', 'lcov', 'text', 'cobertura'],
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
      statements: 73,
      branches: 60,
      lines: 71,
      functions: 67,
    }
  },

};
