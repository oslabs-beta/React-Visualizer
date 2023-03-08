import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    '^node_modules/(.*)$': '<rootDir>/node_modules/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
  },
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: {
    global: {
      lines: 0,
    },
  },
};

export default jestConfig;
