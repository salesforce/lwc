const { RAPTOR_PACKAGE_EXPORTS } = require('./constants');

/**
 * Transforms "unicornRainbow" to "unicorn-rainbow"
 * Taken from https://github.com/sindresorhus/decamelize
 */
function decamelize(str) {
    const sep = '-';
    return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
        .toLowerCase();
}

function findClassMethod(path, name, properties = {}) {
    path.assertClassBody();

    return path.get('body').find(path => (
        isClassMethod(path, {
            name,
            kind: properties.kind || 'method',
            static: properties.static
        })
    ));
}

function findClassProperty(path, name, properties = {}) {
    path.assertClassBody();

    return path.get('body').find(path => (
        path.isClassProperty({ static: properties.static }) &&
        path.get('key').isIdentifier({ name })
    ));
}

function isClassMethod(classMethod, properties = {}) {
    const { kind = 'method', name } = properties;
    return classMethod.isClassMethod({ kind }) &&
           (!name || classMethod.get('key').isIdentifier({ name })) &&
           (properties.static === undefined || classMethod.node.static === properties.static);
}

function isGetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'get',
        name: properties.name,
        static: properties.static
    });
}

function isSetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'set',
        name: properties.name,
        static: properties.static
    });
}

function staticClassProperty(types, name, expression) {
    const classProperty = types.classProperty(types.identifier(name), expression);
    classProperty.static = true;
    return classProperty;
}

function isWireDecorator(path) {
    return path.get('expression').isCallExpression() && path.get('expression.callee').isIdentifier({
        name: RAPTOR_PACKAGE_EXPORTS.WIRE_DECORATOR
    });
}

function isAPIDecorator(path) {
    return path.get('expression').isIdentifier({
        name: RAPTOR_PACKAGE_EXPORTS.API_DECORATOR
    });
}

function isTrackDecorator(path) {
    return path.get('expression').isIdentifier({
        name: RAPTOR_PACKAGE_EXPORTS.TRACK_DECORATOR
    });
}

function getImportsStatements(path, sourceName) {
    const programPath = path.isProgram() ?
        path :
        path.findParent(node => node.isProgram());

    return programPath.get('body').filter(node => (
        node.isImportDeclaration() &&
        node.get('source').isStringLiteral({ value: sourceName })
    ));
}

function getLocalImportLocals(path, sourceName, importedName) {
    const importStatements = getImportsStatements(path, sourceName);

    return importStatements.reduce((acc, node) => (
        [...acc, ...node.get('specifiers')]
    ), []).filter(node => (
        node.get('imported').isIdentifier({ name: importedName })
    )).map(node => (
        node.get('local')
    ));
}

module.exports = {
    decamelize,
    findClassMethod,
    findClassProperty,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    isTrackDecorator,
    isAPIDecorator,
    isWireDecorator,
    staticClassProperty,
    getImportsStatements,
    getLocalImportLocals,
};
