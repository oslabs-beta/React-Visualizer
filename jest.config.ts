import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['node_modules', 'src'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    '^node_modules/(.*)$': '<rootDir>/node_modules/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: {
    global: {
      lines: 0,
    },
  },
};

export default jestConfig;
