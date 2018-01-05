const { isApiDecorator } = require('./shared');
const { isClassMethod, isGetterClassMethod, isSetterClassMethod, staticClassProperty } = require('../../utils');
const { RAPTOR_COMPONENT_PROPERTIES: { PUBLIC_PROPS, PUBLIC_METHODS } } = require('../../constants');

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2
};

function getPropertyBitmask(classProperty) {
    const isGetter = isGetterClassMethod(classProperty);
    const isSetter = isSetterClassMethod(classProperty);

    let bitMask;
    if (isGetter) {
        bitMask = PUBLIC_PROP_BIT_MASK.GETTER;
    } else if (isSetter) {
        bitMask = PUBLIC_PROP_BIT_MASK.SETTER;
    } else {
        bitMask = PUBLIC_PROP_BIT_MASK.PROPERTY;
    }

    return bitMask;
}

/** Returns the public props configuration of a class based on a list decorators. */
function computePublicPropsConfig(decorators) {
    return decorators.reduce((acc, { path }) => {
        const property = path.parentPath;
        const propertyName = property.get('key.name').node;

        if (!(propertyName in acc)) {
            acc[propertyName] = {};
        }

        acc[propertyName].config |= getPropertyBitmask(property);
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
    const publicProps = apiDecorators.filter(({ path }) => !isClassMethod(path.parentPath));

    if (publicProps.length) {
        const publicPropsConfig = computePublicPropsConfig(publicProps);
        klassBody.pushContainer('body', staticClassProperty(
            t,
            PUBLIC_PROPS,
            t.valueToNode(publicPropsConfig)
        ));
    }

    return apiDecorators.filter(({ path }) => (
        path.parentPath.node.kind !== 'get'
    )).map(({ path }) => ({
        name: path.parentPath.get('key.name').node
    }));
}

/** Transform class public methods and returns the list of public methods  */
function transfromPublicMethods(t, klassBody, apiDecorators) {
    const publicMethods = apiDecorators.filter(({ path }) => isClassMethod(path.parentPath));

    if (publicMethods.length) {
        const publicMethodsConfig = computePublicMethodsConfig(publicMethods);
        klassBody.pushContainer('body', staticClassProperty(
            t,
            PUBLIC_METHODS,
            t.valueToNode(publicMethodsConfig)
        ));
    }

    return publicMethods.map(({ path }) => ({
        name: path.parentPath.get('key.name').node
    }));
}

module.exports = function transform(t, klass, decorators) {
    const klassBody = klass.get('body');
    const apiDecorators = decorators.filter(isApiDecorator);

    const apiProperties = transformPublicProps(t, klassBody, apiDecorators);
    const apiMethods = transfromPublicMethods(t, klassBody, apiDecorators);

    return  {
        apiProperties,
        apiMethods,
    };
}
