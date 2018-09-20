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

function getLwcEnginePath(mode) {
    const path = require.resolve('lwc-engine');
    const moduleTypeFolder = 'modules';
    const target = mode.includes('compat') ? 'es5' : 'es2017';

    return path
        .replace('commonjs', moduleTypeFolder)
        .replace('es2017', target);
}

module.exports = {
    getModuleQualifiedName,
    getLwcEnginePath
};
