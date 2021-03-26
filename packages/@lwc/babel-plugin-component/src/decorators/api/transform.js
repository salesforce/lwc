/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isApiDecorator } = require('./shared');
const {
    DECORATOR_TYPES,
    LWC_COMPONENT_PROPERTIES: { PUBLIC_METHODS, PUBLIC_PROPS },
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

function getSiblingGetSetPairType(propertyName, type, classBodyItems) {
    const siblingKind = type === DECORATOR_TYPES.GETTER ? 'set' : 'get';
    const siblingNode = classBodyItems.find((classBodyItem) => {
        const isClassMethod = classBodyItem.isClassMethod({ kind: siblingKind });
        const isSamePropertyName = classBodyItem.node.key.name === propertyName;
        return isClassMethod && isSamePropertyName;
    });
    if (siblingNode) {
        return siblingKind === 'get' ? DECORATOR_TYPES.GETTER : DECORATOR_TYPES.SETTER;
    }
}

function computePublicPropsConfig(publicPropertyMetas, classBodyItems) {
    return publicPropertyMetas.reduce((acc, { propertyName, decoratedNodeType }) => {
        if (!(propertyName in acc)) {
            acc[propertyName] = {};
        }
        acc[propertyName].config |= getPropertyBitmask(decoratedNodeType);

        if (
            decoratedNodeType === DECORATOR_TYPES.GETTER ||
            decoratedNodeType === DECORATOR_TYPES.SETTER
        ) {
            // With the latest decorator spec, only one of the getter/setter pair needs a decorator.
            // We need to add the proper bitmask for the sibling getter/setter if it exists.
            const pairType = getSiblingGetSetPairType(
                propertyName,
                decoratedNodeType,
                classBodyItems
            );
            if (pairType) {
                acc[propertyName].config |= getPropertyBitmask(pairType);
            }
        }

        return acc;
    }, {});
}

module.exports = function transform(t, decoratorMetas, classBodyItems) {
    const objectProperties = [];
    const apiDecoratorMetas = decoratorMetas.filter(isApiDecorator);
    const publicPropertyMetas = apiDecoratorMetas.filter(
        ({ decoratedNodeType }) => decoratedNodeType !== DECORATOR_TYPES.METHOD
    );
    if (publicPropertyMetas.length) {
        const propsConfig = computePublicPropsConfig(publicPropertyMetas, classBodyItems);
        objectProperties.push(
            t.objectProperty(t.identifier(PUBLIC_PROPS), t.valueToNode(propsConfig))
        );
    }

    const publicMethodMetas = apiDecoratorMetas.filter(
        ({ decoratedNodeType }) => decoratedNodeType === DECORATOR_TYPES.METHOD
    );
    if (publicMethodMetas.length) {
        const methodNames = publicMethodMetas.map(({ propertyName }) => propertyName);
        objectProperties.push(
            t.objectProperty(t.identifier(PUBLIC_METHODS), t.valueToNode(methodNames))
        );
    }
    return objectProperties;
};
