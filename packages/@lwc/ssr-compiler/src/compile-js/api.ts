/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { DecoratorErrors } from '@lwc/errors';
import { generateError } from './errors';
import type {
    MethodDefinition as EsMethodDefinition,
    PropertyDefinition as EsPropertyDefinition,
} from 'estree';

const DISALLOWED_PROP_SET = new Set(['is', 'class', 'slot', 'style']);

const AMBIGUOUS_PROP_SET = new Map([
    ['bgcolor', 'bgColor'],
    ['accesskey', 'accessKey'],
    ['contenteditable', 'contentEditable'],
    ['tabindex', 'tabIndex'],
    ['maxlength', 'maxLength'],
    ['maxvalue', 'maxValue'],
]);

export function validatePropertyValue(property: EsPropertyDefinition) {
    if (is.literal(property.value, { value: true })) {
        throw generateError(DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY);
    }
}

export function validatePropertyName(property: EsMethodDefinition | EsPropertyDefinition) {
    if (property.computed || !('name' in property.key)) {
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
