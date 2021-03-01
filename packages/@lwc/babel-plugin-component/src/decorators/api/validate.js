/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { DecoratorErrors } = require('@lwc/errors');
const { isApiDecorator } = require('./shared');
const {
    AMBIGUOUS_PROP_SET,
    DISALLOWED_PROP_SET,
    LWC_PACKAGE_EXPORTS: { TRACK_DECORATOR },
    DECORATOR_TYPES,
} = require('../../constants');

const { generateError } = require('../../utils');

function validateConflict(path, decorators) {
    const isPublicFieldTracked = decorators.some(
        (decorator) =>
            decorator.name === TRACK_DECORATOR &&
            decorator.path.parentPath.node === path.parentPath.node
    );

    if (isPublicFieldTracked) {
        throw generateError(path, {
            errorInfo: DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT,
        });
    }
}

function isBooleanPropDefaultTrue(property) {
    const propertyValue = property.node.value;
    return propertyValue && propertyValue.type === 'BooleanLiteral' && propertyValue.value;
}

function validatePropertyValue(property) {
    if (isBooleanPropDefaultTrue(property)) {
        throw generateError(property, {
            errorInfo: DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY,
        });
    }
}

function validatePropertyName(property) {
    if (property.node.computed) {
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED,
        });
    }

    const propertyName = property.get('key.name').node;

    if (propertyName === 'part') {
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_NAME_PART_IS_RESERVED,
            messageArgs: [propertyName],
        });
    } else if (propertyName.startsWith('on')) {
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_ON,
            messageArgs: [propertyName],
        });
    } else if (propertyName.startsWith('data') && propertyName.length > 4) {
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_DATA,
            messageArgs: [propertyName],
        });
    } else if (DISALLOWED_PROP_SET.has(propertyName)) {
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_NAME_IS_RESERVED,
            messageArgs: [propertyName],
        });
    } else if (AMBIGUOUS_PROP_SET.has(propertyName)) {
        const camelCased = AMBIGUOUS_PROP_SET.get(propertyName);
        throw generateError(property, {
            errorInfo: DecoratorErrors.PROPERTY_NAME_IS_AMBIGUOUS,
            messageArgs: [propertyName, camelCased],
        });
    }
}

function validateSingleApiDecoratorOnSetterGetterPair(decorators) {
    // keep track of visited class methods
    const visitedMethods = new Set();

    decorators.forEach((decorator) => {
        const { path, decoratedNodeType } = decorator;

        // since we are validating get/set we only look at @api methods
        if (
            isApiDecorator(decorator) &&
            (decoratedNodeType === DECORATOR_TYPES.GETTER ||
                decoratedNodeType === DECORATOR_TYPES.SETTER)
        ) {
            const methodPath = path.parentPath;
            const methodName = methodPath.get('key.name').node;

            if (visitedMethods.has(methodName)) {
                throw generateError(methodPath, {
                    errorInfo: DecoratorErrors.SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR,
                    messageArgs: [methodName],
                });
            }

            visitedMethods.add(methodName);
        }
    });
}

function validateUniqueness(decorators) {
    const apiDecorators = decorators.filter(isApiDecorator);
    for (let i = 0; i < apiDecorators.length; i++) {
        const { path: currentPath, type: currentType } = apiDecorators[i];
        const currentPropertyName = currentPath.parentPath.get('key.name').node;

        for (let j = 0; j < apiDecorators.length; j++) {
            const { path: comparePath, type: compareType } = apiDecorators[j];
            const comparePropertyName = comparePath.parentPath.get('key.name').node;

            // We will throw if the considered properties have the same name, and when their
            // are not part of a pair of getter/setter.
            const haveSameName = currentPropertyName === comparePropertyName;
            const isDifferentProperty = currentPath !== comparePath;
            const isGetterSetterPair =
                (currentType === DECORATOR_TYPES.GETTER &&
                    compareType === DECORATOR_TYPES.SETTER) ||
                (currentType === DECORATOR_TYPES.SETTER && compareType === DECORATOR_TYPES.GETTER);

            if (haveSameName && isDifferentProperty && !isGetterSetterPair) {
                throw generateError(comparePath, {
                    errorInfo: DecoratorErrors.DUPLICATE_API_PROPERTY,
                    messageArgs: [currentPropertyName],
                });
            }
        }
    }
}

module.exports = function validate(decorators) {
    const apiDecorators = decorators.filter(isApiDecorator);
    if (apiDecorators.length === 0) {
        return;
    }

    apiDecorators.forEach(({ path, decoratedNodeType }) => {
        validateConflict(path, decorators);

        if (decoratedNodeType !== DECORATOR_TYPES.METHOD) {
            const property = path.parentPath;

            validatePropertyName(property);
            validatePropertyValue(property);
        }
    });

    validateSingleApiDecoratorOnSetterGetterPair(decorators);
    validateUniqueness(decorators);
};
