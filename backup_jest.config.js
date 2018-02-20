module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.ts': require.resolve('ts-jest/preprocessor.js'),
        '.js': require.resolve('ts-jest/preprocessor.js')
    },
    //testRegex: '/__tests__/.*spec\\.(ts|js)$',
    testRegex: '/x',
    projects: [
        '<rootDir>',
        '<rootDir>/packages/*/jest.config.js'
    ]
};
