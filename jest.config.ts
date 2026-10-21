import { Config } from 'jest';

const jestConfig: Config = {
  testEnvironment: 'node',
  projects: [
    'packages/flux',
  ],
  transform: {
    '^.+.tsx?$': ['ts-jest',{}],
  },
};

export default jestConfig;
