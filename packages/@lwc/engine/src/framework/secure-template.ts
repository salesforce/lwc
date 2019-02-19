/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Template } from './template';

const signedTemplateSet: Set<Template> = new Set();

export function defaultEmptyTemplate() {
    return [];
}
signedTemplateSet.add(defaultEmptyTemplate);

export function isTemplateRegistered(tpl: Template): boolean {
    return signedTemplateSet.has(tpl);
}

// chaining this method as a way to wrap existing
// assignment of templates easily, without too much transformation
export function registerTemplate(tpl: Template): Template {
    signedTemplateSet.add(tpl);
    return tpl;
}

// locker-service patches this function during runtime to sanitize vulnerable attributes.
// when ran off-core this function becomes a noop and returns the user authored value.
export function sanitizeAttribute(
    tagName: string,
    namespaceUri: string,
    attrName: string,
    attrValue: any,
) {
    return attrValue;
}
