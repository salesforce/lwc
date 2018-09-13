const { getNamespacedIdForResource } = require('lwc-compiler-utils');

module.exports = function namespaceReplaceVisitor({ types: t }, config) {
    if (!config) {
        return {};
    }

    const { namespaceMapping = {} } = config;

    // Return an empty visitor if namespace doesn't need to be mapped
    if (!Object.keys(namespaceMapping).length) {
        return {};
    }

    return {
        ImportDeclaration(path) {
            const moduleName = path.node.source.value;
            const updatedModuleName = getNamespacedIdForResource(moduleName, namespaceMapping);

            if (moduleName !== updatedModuleName) {
                path
                    .get('source')
                    .replaceWith(t.stringLiteral(updatedModuleName));
            }
        },
    };
};
