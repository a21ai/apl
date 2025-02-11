export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@repo/arch-sdk/(.*)$': '<rootDir>/../arch-sdk/dist/$1.cjs',
    '^@repo/arch-sdk$': '<rootDir>/../arch-sdk/dist/index.cjs',
    '^@repo/apl-sdk/(.*)$': '<rootDir>/../apl-sdk/dist/$1.cjs',
    '^@repo/apl-sdk$': '<rootDir>/../apl-sdk/dist/index.cjs'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@repo/arch-sdk|@repo/apl-sdk)/.*)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
};
