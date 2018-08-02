module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.js': require.resolve('./test-preprocessors-js.js'),
        '.ts': require.resolve('./test-preprocessors-typescript.js')
    },
    testMatch: [
        '<rootDir>/**/__tests__/*.spec.(js|ts)'
    ],
};
