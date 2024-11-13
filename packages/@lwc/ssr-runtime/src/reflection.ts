/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    create,
    htmlPropertyToAttribute,
    isAriaAttribute,
    isGlobalHtmlAttribute,
    keys,
} from '@lwc/shared';

/**
 * Filters out the following types of properties that should not be set.
 * - Properties that are not public.
 * - Properties that are not global.
 * - Properties that are global but are internally overridden.
 */
export function filterProperties(
    props: Record<string, unknown>,
    publicFields: Array<string>,
    privateFields: Array<string>
): Record<string, unknown> {
    const propsToAssign = create(null);
    const publicFieldSet = new Set(publicFields);
    const privateFieldSet = new Set(privateFields);
    keys(props).forEach((propName) => {
        const attrName = htmlPropertyToAttribute(propName);
        if (
            publicFieldSet.has(propName) ||
            ((isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) &&
                !privateFieldSet.has(propName))
        ) {
            propsToAssign[propName] = props[propName];
        }
    });
    return propsToAssign;
}
