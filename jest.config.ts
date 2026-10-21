import { Config } from 'jest';

const jestConfig: Config = {
  testEnvironment: 'node',
  projects: [
    'packages/flux',
    'packages/utils',
  ],
  transform: {
    '^.+.tsx?$': ['ts-jest',{}],
  },
};

export default jestConfig;
