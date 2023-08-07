/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Template } from './template';
import { checkVersionMismatch } from './check-version-mismatch';

const signedTemplateSet: Set<Template> = new Set();

export function defaultEmptyTemplate() {
    return [];
}
signedTemplateSet.add(defaultEmptyTemplate);

export function isTemplateRegistered(tpl: Template): boolean {
    return signedTemplateSet.has(tpl);
}

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerTemplate(tpl: Template): Template {
    if (process.env.NODE_ENV !== 'production') {
        checkVersionMismatch(tpl, 'template');
    }
    signedTemplateSet.add(tpl);

    // chaining this method as a way to wrap existing
    // assignment of templates easily, without too much transformation
    return tpl;
}

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
 * libraries to sanitize vulnerable attributes.
 */
export function sanitizeAttribute(
    tagName: string,
    namespaceUri: string,
    attrName: string,
    attrValue: any
): string {
    // locker-service patches this function during runtime to sanitize vulnerable attributes. When
    // ran off-core this function becomes a noop and returns the user authored value.
    return attrValue;
}
