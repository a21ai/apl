export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@repo/arch-sdk/(.*)$': '<rootDir>/../arch-sdk/dist/$1.cjs',
    '^@repo/arch-sdk$': '<rootDir>/../arch-sdk/dist/index.cjs',
    '^@noble/curves/(.*)$': '<rootDir>/../../node_modules/@noble/curves/$1.js',
    '^@scure/btc-signer/(.*)$': '<rootDir>/../../node_modules/@scure/btc-signer/$1.js',
    '^@scure/btc-signer$': '<rootDir>/../../node_modules/@scure/btc-signer/index.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@repo/arch-sdk|@noble/curves|@scure/btc-signer)/.*)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
