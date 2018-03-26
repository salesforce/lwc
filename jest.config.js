module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.ts': require.resolve('ts-jest/preprocessor.js'),
        '.js': require.resolve('ts-jest/preprocessor.js')
    },
    testMatch: [
        '<rootDir>/packages/*/**/__tests__/*.spec.(js|ts)'
    ],
    projects: [
        '<rootDir>'
    ]
};
