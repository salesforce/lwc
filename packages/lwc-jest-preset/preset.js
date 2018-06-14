/* eslint-env node */
const jestPreset = require('./jest-preset.json');
// moduleNameMaper isn't specified in jest-preset.json because it can't properly
// specify the path for the mock resources in auraStorageStub.js and auraStub.js
// so, we add it here only.
jestPreset.moduleNameMapper = {
    '^assert$': require.resolve('./dist/assertStub.js'),
    '^aura$': require.resolve('./dist/auraStub.js'),
    '^aura-instrumentation$': require.resolve('./dist/auraInstrumentationStub.js'),
    // instrumentation-service is an alias to aura-instrumentation. see core/ui-instrumentation-components/modules/instrumentation/service/service.js
    '^instrumentation-service$': require.resolve('./dist/auraInstrumentationStub.js'),
    '^aura-storage$': require.resolve('./dist/auraStorageStub.js'),
    '^logger$': require.resolve('./dist/loggerStub.js'),
    '^lwc-test-utils$': require.resolve('lwc-test-utils'),
};
// Jest by default looks for transformer/resolver modules using the cwd of where
// jest was launched from. When running against projects that are not NPMs
// themselves, Jest will fail to load them.
// Solution is to always require the full path.
if (jestPreset.resolver) {
    jestPreset.resolver = require.resolve(jestPreset.resolver);
}
if (jestPreset.transform) {
    Object.keys(jestPreset.transform).forEach(key => {
        jestPreset.transform[key] = require.resolve(jestPreset.transform[key]);
    });
}
if (jestPreset.snapshotSerializers) {
    Object.keys(jestPreset.snapshotSerializers).forEach(key => {
        jestPreset.snapshotSerializers[key] = require.resolve(jestPreset.snapshotSerializers[key]);
    });
}
module.exports = jestPreset;
