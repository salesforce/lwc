/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isApiDecorator } = require('./shared');
const { markAsLWCNode, staticClassProperty } = require('../../utils');
const {
    LWC_COMPONENT_PROPERTIES: { PUBLIC_PROPS, PUBLIC_METHODS },
    DECORATOR_TYPES,
} = require('../../constants');

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2,
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

function getSiblingGetSetPair(propertyPath, propertyName, type) {
    const siblingType = type === 'getter' ? 'set' : 'get';
    const klassBody = propertyPath.parentPath.get('body');
    const siblingNode = klassBody.find(
        classMethodPath =>
            classMethodPath !== propertyPath &&
            classMethodPath.isClassMethod({ kind: siblingType }) &&
            classMethodPath.node.key.name === propertyName
    );

    if (siblingNode) {
        const decoratorType =
            siblingType === 'get' ? DECORATOR_TYPES.GETTER : DECORATOR_TYPES.SETTER;
        return { type: decoratorType, path: siblingNode };
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

        // With the latest decorator spec a decorator only need to be in one of the getter/setter pair
        // We need to add the proper bitmask for the sibling getter/setter if exists
        const siblingPair = getSiblingGetSetPair(property, propertyName, type);
        if (siblingPair) {
            acc[propertyName].config |= getPropertyBitmask(siblingPair.type);
        }

        return acc;
    }, {});
}

/** Returns the public methods configuration of class based on a list of decorators. */
function computePublicMethodsConfig(decorators) {
    return decorators.map(({ path }) => path.parentPath.get('key.name').node);
}

/** Transform class public props and returns the list of public props */
function transformPublicProps(t, klassBody, apiDecorators) {
    const publicProps = apiDecorators.filter(({ type }) => type !== DECORATOR_TYPES.METHOD);

    if (publicProps.length) {
        const publicPropsConfig = computePublicPropsConfig(publicProps);
        const staticProp = staticClassProperty(t, PUBLIC_PROPS, t.valueToNode(publicPropsConfig));

        markAsLWCNode(staticProp);
        klassBody.pushContainer('body', staticProp);
    }
}

/** Transform class public methods and returns the list of public methods  */
function transformPublicMethods(t, klassBody, apiDecorators) {
    const publicMethods = apiDecorators.filter(({ type }) => type === DECORATOR_TYPES.METHOD);

    if (publicMethods.length) {
        const publicMethodsConfig = computePublicMethodsConfig(publicMethods);
        const classProp = staticClassProperty(
            t,
            PUBLIC_METHODS,
            t.valueToNode(publicMethodsConfig)
        );
        markAsLWCNode(classProp);
        klassBody.pushContainer('body', classProp);
    }
}

module.exports = function transform(t, klass, decorators) {
    const klassBody = klass.get('body');
    const apiDecorators = decorators.filter(isApiDecorator);

    transformPublicProps(t, klassBody, apiDecorators);
    transformPublicMethods(t, klassBody, apiDecorators);
};
