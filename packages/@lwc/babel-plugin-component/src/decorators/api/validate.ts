/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { NodePath } from '@babel/traverse';
import { types } from '@babel/core';
import { generateError } from '../../utils';
import { LwcBabelPluginPass } from '../../types';
import {
    AMBIGUOUS_PROP_SET,
    DECORATOR_TYPES,
    DISALLOWED_PROP_SET,
    LWC_PACKAGE_EXPORTS,
} from '../../constants';
import { DecoratorMeta } from '../index';
import { isApiDecorator } from './shared';

const { TRACK_DECORATOR } = LWC_PACKAGE_EXPORTS;

function validateConflict(
    path: NodePath<types.Node>,
    decorators: DecoratorMeta[],
    state: LwcBabelPluginPass
) {
    const isPublicFieldTracked = decorators.some(
        (decorator) =>
            decorator.name === TRACK_DECORATOR &&
            decorator.path.parentPath.node === path.parentPath!.node
    );

    if (isPublicFieldTracked) {
        throw generateError(
            path,
            {
                errorInfo: DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT,
            },
            state
        );
    }
}

function isBooleanPropDefaultTrue(property: NodePath<types.Node>) {
    const propertyValue = (property.node as any).value;
    return propertyValue && propertyValue.type === 'BooleanLiteral' && propertyValue.value;
}

function validatePropertyValue(property: NodePath<types.ClassMethod>, state: LwcBabelPluginPass) {
    if (isBooleanPropDefaultTrue(property)) {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY,
            },
            state
        );
    }
}

function validatePropertyName(property: NodePath<types.ClassMethod>, state: LwcBabelPluginPass) {
    if (property.node.computed) {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED,
            },
            state
        );
    }

    const propertyName = (property.get('key.name') as any).node;

    if (propertyName === 'part') {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_PART_IS_RESERVED,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (propertyName.startsWith('on')) {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_ON,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (propertyName.startsWith('data') && propertyName.length > 4) {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_DATA,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (DISALLOWED_PROP_SET.has(propertyName)) {
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_IS_RESERVED,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (AMBIGUOUS_PROP_SET.has(propertyName)) {
        const camelCased = AMBIGUOUS_PROP_SET.get(propertyName);
        throw generateError(
            property,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_IS_AMBIGUOUS,
                messageArgs: [propertyName, camelCased],
            },
            state
        );
    }
}

function validateSingleApiDecoratorOnSetterGetterPair(
    decorators: DecoratorMeta[],
    state: LwcBabelPluginPass
) {
    // keep track of visited class methods
    const visitedMethods = new Set<String>();

    decorators.forEach((decorator) => {
        const { path, decoratedNodeType } = decorator;

        // since we are validating get/set we only look at @api methods
        if (
            isApiDecorator(decorator) &&
            (decoratedNodeType === DECORATOR_TYPES.GETTER ||
                decoratedNodeType === DECORATOR_TYPES.SETTER)
        ) {
            const methodPath = path.parentPath as NodePath<types.ClassMethod | types.ClassProperty>;
            const methodName = (methodPath.get('key.name') as any).node as string;

            if (visitedMethods.has(methodName)) {
                throw generateError(
                    methodPath,
                    {
                        errorInfo: DecoratorErrors.SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR,
                        messageArgs: [methodName],
                    },
                    state
                );
            }

            visitedMethods.add(methodName);
        }
    });
}

function validateUniqueness(decorators: DecoratorMeta[], state: LwcBabelPluginPass) {
    const apiDecorators = decorators.filter(isApiDecorator);
    for (let i = 0; i < apiDecorators.length; i++) {
        const { path: currentPath, type: currentType } = apiDecorators[i];
        const currentPropertyName = (currentPath.parentPath.get('key.name') as any).node as string;

        for (let j = 0; j < apiDecorators.length; j++) {
            const { path: comparePath, type: compareType } = apiDecorators[j];
            const comparePropertyName = (comparePath.parentPath.get('key.name') as any)
                .node as string;

            // We will throw if the considered properties have the same name, and when their
            // are not part of a pair of getter/setter.
            const haveSameName = currentPropertyName === comparePropertyName;
            const isDifferentProperty = currentPath !== comparePath;
            const isGetterSetterPair =
                (currentType === DECORATOR_TYPES.GETTER &&
                    compareType === DECORATOR_TYPES.SETTER) ||
                (currentType === DECORATOR_TYPES.SETTER && compareType === DECORATOR_TYPES.GETTER);

            if (haveSameName && isDifferentProperty && !isGetterSetterPair) {
                throw generateError(
                    comparePath,
                    {
                        errorInfo: DecoratorErrors.DUPLICATE_API_PROPERTY,
                        messageArgs: [currentPropertyName],
                    },
                    state
                );
            }
        }
    }
}

export default function validate(decorators: DecoratorMeta[], state: LwcBabelPluginPass) {
    const apiDecorators = decorators.filter(isApiDecorator);
    if (apiDecorators.length === 0) {
        return;
    }

    apiDecorators.forEach(({ path, decoratedNodeType }) => {
        validateConflict(path, decorators, state);

        if (decoratedNodeType !== DECORATOR_TYPES.METHOD) {
            const property = path.parentPath as NodePath<types.ClassMethod>;

            validatePropertyName(property, state);
            validatePropertyValue(property, state);
        }
    });

    validateSingleApiDecoratorOnSetterGetterPair(decorators, state);
    validateUniqueness(decorators, state);
}
