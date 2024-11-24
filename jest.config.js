module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.ts'], // Centralized test folder
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // Alias for your source folder
    },
    setupFiles: ['dotenv/config'], // Load .env.test before tests
    globalSetup: './packages/api/test/setup.ts', // Optional setup script
    globalTeardown: './packages/api/test/teardown.ts', // Optional teardown script
    clearMocks: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
};
