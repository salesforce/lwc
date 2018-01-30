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

const API_DECORATOR = 'api';
const TRACK_DECORATOR = 'track';
const WIRE_DECORATOR = 'wire';

function isWireDecorator(path) {
    return path.get('expression').isCallExpression() &&
        path.get('expression.callee').isIdentifier({ name: WIRE_DECORATOR });
}

function isAPIDecorator(path) {
    return path.get('expression').isIdentifier({
        name: API_DECORATOR
    });
}

function isTrackDecorator(path) {
    return path.get('expression').isIdentifier({
        name: TRACK_DECORATOR
    });
}

module.exports = {
    findClassMethod,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    isAPIDecorator,
    isTrackDecorator,
    isWireDecorator,
    staticClassProperty,
};
