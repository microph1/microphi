import { Config } from 'jest';

const jestConfig: Config = {
  testEnvironment: 'node',
  projects: [
    'packages/*'
  ],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
}

export default jestConfig
