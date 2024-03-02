import type { JestConfigWithTsJest } from 'ts-jest'

// import { defaultsESM as tsjPreset } from 'ts-jest/presets';
// import { jsWithTs as tsjPreset } from 'ts-jest/presets';
// import { jsWithTsESM as tsjPreset } from 'ts-jest/presets';
// import { jsWithBabel as tsjPreset } from 'ts-jest/presets';
// import { jsWithBabelESM as tsjPreset } from 'ts-jest/presets';

const jestConfig: JestConfigWithTsJest = {
  // [...]
  projects: [
    'packages/*'
  ],
  preset: 'ts-jest',
  coverageReporters: ['json', 'html', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    "**/src/**/!(*.spec).ts",
    "!**/*.experiment.ts",
    "!**/index.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 73.1,
      branches: 48.39,
      functions: 79.63,
      lines: 72.63,
    }
  },
}

console.log(jestConfig.transform);
export default jestConfig
