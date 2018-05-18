module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.ts': require.resolve('ts-jest/preprocessor.js'),
    },
    testMatch: [
        '<rootDir>/**/__tests__/**/*.spec.ts'
    ],
    setupTestFrameworkScriptFile: '<rootDir>/scripts/jest/setup.ts',
};
