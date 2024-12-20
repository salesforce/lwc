/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { DecoratorErrors } from '@lwc/errors';
import { generateError } from '../errors';
import { isMethodKind, type ComponentMetaState } from '../types';
import { DISALLOWED_PROP_SET, AMBIGUOUS_PROP_SET } from './consts';
import type { ApiPropertyDefinition, ApiDefinition, ApiMethodDefinition } from './types';

function validateName(definition: ApiDefinition) {
    if (definition.computed) {
        throw generateError(DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED);
    }

    const propertyName = definition.key.name;

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

function validatePropertyValue(property: ApiPropertyDefinition) {
    if (property.value && property.value.type === 'Literal' && property.value.value === true) {
        throw generateError(DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY);
    }
}

function validatePropertyUnique(node: ApiPropertyDefinition, state: ComponentMetaState) {
    if (state.publicFields.has(node.key.name)) {
        throw generateError(DecoratorErrors.DUPLICATE_API_PROPERTY, node.key.name);
    }
}

export function validateApiProperty(node: ApiPropertyDefinition, state: ComponentMetaState) {
    validatePropertyUnique(node, state);
    validateName(node);
    validatePropertyValue(node);
}

function validateUniqueMethod(node: ApiMethodDefinition, state: ComponentMetaState) {
    const field = state.publicFields.get(node.key.name);

    if (field) {
        if (
            field.type === 'MethodDefinition' &&
            isMethodKind(field, ['get', 'set']) &&
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

export function validateApiMethod(node: ApiMethodDefinition, state: ComponentMetaState) {
    validateUniqueMethod(node, state);
    validateName(node);
}
