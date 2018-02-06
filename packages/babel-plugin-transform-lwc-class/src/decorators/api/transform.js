const { isApiDecorator } = require('./shared');
const { staticClassProperty } = require('../../utils');
const { LWC_COMPONENT_PROPERTIES: { PUBLIC_PROPS, PUBLIC_METHODS }, DECORATOR_TYPES } = require('../../constants');

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2
};

function getPropertyBitmask(type) {
    switch (type) {
        case DECORATOR_TYPES.GETTER:
            return PUBLIC_PROP_BIT_MASK.GETTER;

        case DECORATOR_TYPES.SETTER:
            return PUBLIC_PROP_BIT_MASK.SETTER;

        default:
            return PUBLIC_PROP_BIT_MASK.PROPERTY;
    }
}

/** Returns the public props configuration of a class based on a list decorators. */
function computePublicPropsConfig(decorators) {
    return decorators.reduce((acc, { path, type }) => {
        const property = path.parentPath;
        const propertyName = property.get('key.name').node;

        if (!(propertyName in acc)) {
            acc[propertyName] = {};
        }

        acc[propertyName].config |= getPropertyBitmask(type);
        return acc;
    }, {});
}

/** Returns the public methods configuration of class based on a list of decorators. */
function computePublicMethodsConfig(decorators) {
    return decorators.map(({ path }) => (
        path.parentPath.get('key.name').node
    ));
}

/** Transform class public props and returns the list of public props */
function transformPublicProps(t, klassBody, apiDecorators) {
    const publicProps = apiDecorators.filter(({ type }) => type !== DECORATOR_TYPES.METHOD);

    if (publicProps.length) {
        const publicPropsConfig = computePublicPropsConfig(publicProps);
        klassBody.pushContainer('body', staticClassProperty(
            t,
            PUBLIC_PROPS,
            t.valueToNode(publicPropsConfig)
        ));
    }

    return publicProps.filter(({ path }) => (
        path.parentPath.node.kind !== 'get'
    )).map(({ path }) => ({
        type: 'property',
        name: path.parentPath.get('key.name').node
    }));
}

/** Transform class public methods and returns the list of public methods  */
function transfromPublicMethods(t, klassBody, apiDecorators) {
    const publicMethods = apiDecorators.filter(({ type }) => type === DECORATOR_TYPES.METHOD);

    if (publicMethods.length) {
        const publicMethodsConfig = computePublicMethodsConfig(publicMethods);
        klassBody.pushContainer('body', staticClassProperty(
            t,
            PUBLIC_METHODS,
            t.valueToNode(publicMethodsConfig)
        ));
    }

    return publicMethods.map(({ path }) => ({
        type: 'method',
        name: path.parentPath.get('key.name').node,
        args: path.parentPath.get('params').map(paramPath => paramPath.node.name)
    }));
}

module.exports = function transform(t, klass, decorators) {
    const klassBody = klass.get('body');
    const apiDecorators = decorators.filter(isApiDecorator);

    const apiProperties = transformPublicProps(t, klassBody, apiDecorators);
    const apiMethods = transfromPublicMethods(t, klassBody, apiDecorators);
    Array.prototype.push.apply(apiProperties, apiMethods);

    return  {
        type: 'api',
        decorations: apiProperties
    };
}
