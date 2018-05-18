module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.js': require.resolve('ts-jest/preprocessor.js'),
        '.ts': require.resolve('ts-jest/preprocessor.js'),
    },
    testMatch: [
        '<rootDir>/**/__tests__/**/*.spec.js'
    ],
};
