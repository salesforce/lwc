/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['js', 'html'],
    moduleNameMapper: {
        '^assert$': require.resolve('./dist/assertStub.js'),
        '^aura$': require.resolve('./dist/auraStub.js'),
        '^aura-instrumentation$': require.resolve('./dist/auraInstrumentationStub.js'),
        '^instrumentation-service$': require.resolve('./dist/auraInstrumentationStub.js'),
        '^aura-storage$': require.resolve('./dist/auraStorageStub.js'),
        '^logger$': require.resolve('./dist/loggerStub.js'),
        '^lwc-test-utils$': require.resolve('lwc-test-utils'),
    },
    resolver: require.resolve('lwc-jest-resolver'),
    transform: {
        '^.+\\.(js|html|css)$': require.resolve('lwc-jest-transformer'),
    },
    setupFiles: [
        require.resolve('./setup'),
    ],
    snapshotSerializers: [require.resolve('lwc-jest-serializer')],
    testMatch: [ '**/__tests__/**/?(*.)(spec|test).js' ],

    // temp workaround until this is released - https://github.com/facebook/jest/pull/6792
    testURL: "http://localhost/",
};
