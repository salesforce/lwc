/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { DecoratorErrors } from '@lwc/errors';
import { generateError } from './errors';
import { isMethodKind, type ComponentMetaState } from './types';
import type { MethodDefinition, PropertyDefinition, Identifier, Decorator } from 'estree';

const DISALLOWED_PROP_SET = new Set(['is', 'class', 'slot', 'style']);

const AMBIGUOUS_PROP_SET = new Map([
    ['bgcolor', 'bgColor'],
    ['accesskey', 'accessKey'],
    ['contenteditable', 'contentEditable'],
    ['tabindex', 'tabIndex'],
    ['maxlength', 'maxLength'],
    ['maxvalue', 'maxValue'],
]);

export function validatePropertyValue(property: PropertyDefinition) {
    if (is.literal(property.value, { value: true })) {
        throw generateError(DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY);
    }
}

export function validateName(
    property: (MethodDefinition & { key: Identifier }) | (PropertyDefinition & { key: Identifier })
) {
    if (property.computed) {
        throw generateError(DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED);
    }

    const propertyName = property.key.name;

    switch (true) {
        case propertyName === 'part':
            throw generateError(DecoratorErrors.PROPERTY_NAME_PART_IS_RESERVED, propertyName);
        case propertyName.startsWith('on'):
            throw generateError(DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_ON, propertyName);
        case propertyName.startsWith('data') && propertyName.length > 4:
            throw generateError(DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_DATA, propertyName);
        case DISALLOWED_PROP_SET.has(propertyName):
            throw generateError(DecoratorErrors.PROPERTY_NAME_IS_RESERVED, propertyName);
        case AMBIGUOUS_PROP_SET.has(propertyName):
            throw generateError(
                DecoratorErrors.PROPERTY_NAME_IS_AMBIGUOUS,
                propertyName,
                AMBIGUOUS_PROP_SET.get(propertyName)!
            );
    }
}

export function validateUniqueProperty(
    node: PropertyDefinition & { key: Identifier },
    state: ComponentMetaState
) {
    if (state.publicFields.has(node.key.name)) {
        throw generateError(DecoratorErrors.DUPLICATE_API_PROPERTY, node.key.name);
    }
}

export function validateUniqueMethod(
    node: MethodDefinition & { key: Identifier },
    state: ComponentMetaState
) {
    const field = state.publicFields.get(node.key.name);

    if (field) {
        if (
            is.methodDefinition(field) &&
            isMethodKind(field, ['get', 'set']) &&
            is.methodDefinition(node) &&
            isMethodKind(node, ['get', 'set'])
        ) {
            throw generateError(
                DecoratorErrors.SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR,
                node.key.name
            );
        }

        throw generateError(DecoratorErrors.DUPLICATE_API_PROPERTY, node.key.name);
    }
}

export function validateApiProperty(
    node: PropertyDefinition & { key: Identifier },
    state: ComponentMetaState
) {
    validateUniqueProperty(node, state);
    validateName(node);
    validatePropertyValue(node);
}

export function validateApiMethod(
    node: MethodDefinition & { key: Identifier },
    state: ComponentMetaState
) {
    validateUniqueMethod(node, state);
    validateName(node);
}

export function isApiDecorator(
    decorator: Decorator | undefined
): decorator is Decorator & { expression: Identifier & { name: 'api' } } {
    return is.identifier(decorator?.expression) && decorator.expression.name === 'api';
}
