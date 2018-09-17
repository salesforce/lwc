const path = require('path');

function getModuleQualifiedName(file) {
    const registry = {
        entry: file,
        moduleSpecifier: null,
        moduleName: null,
        moduleNamespace: null
    };

    const rootParts = path.dirname(file).split(path.sep);

    registry.moduleName = rootParts.pop();
    registry.moduleNamespace = rootParts.pop();

    return registry;
}

function normalizeResult(result) {
    return { code: result.code || result, map: result.map || { mappings: "" } };
}

function getLwcEnginePath(mode) {
    const path = require.resolve('lwc-engine');
    const moduleTypeFolder = 'modules';
    const target = mode.includes('compat') ? 'es5' : 'es2017';

    return path
        .replace('commonjs', moduleTypeFolder)
        .replace('es2017', target);
}

function resolveRollupCompat({ mode, compat }) {
    if (mode === 'compat' || mode === 'prod_compat') {
        try {
            // We will compose compat plugin on top of this one (delegated)
            return require("rollup-plugin-compat").default(compat);
        } catch (e) {
            throw new Error(
                `Unable to compile resources for mode ${mode}` +
                `In order to use "compat" mode, you must include 'rollup-plugin-compat' as part of your dependencies`
            );
        }
    }
    // If we are not in compat, rollup becomes a noop
    // This just simplifies the logic bellow
    return {
        resolveId() { return undefined; },
        load() { return undefined; },
        knownCompatModule() { return false; },
        transform(src) { return src; },
        transformBundle(src) { return src; }
    };
}

module.exports = {
    getModuleQualifiedName,
    normalizeResult,
    getLwcEnginePath,
    resolveRollupCompat
};
