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
}

export default jestConfig
