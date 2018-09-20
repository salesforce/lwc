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

module.exports = {
    getModuleQualifiedName
};
