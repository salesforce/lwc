/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { Template } from './template';
import { checkVersionMismatch } from './check-version-mismatch';
import { flattenStylesheets } from './utils';

const signedTemplateSet: Set<Template> = new Set();

export function defaultEmptyTemplate() {
    return [];
}
signedTemplateSet.add(defaultEmptyTemplate);

export function isTemplateRegistered(tpl: Template): boolean {
    return signedTemplateSet.has(tpl);
}

function validateTemplateVersion(template: Template) {
    // Validate that the template was compiled with the same version of the LWC compiler used for the runtime engine.
    // Note this only works in unminified dev mode because it relies on code comments.
    checkVersionMismatch(template, 'template');
    if (!isUndefined(template.stylesheets)) {
        for (const stylesheet of flattenStylesheets(template.stylesheets)) {
            // Verify that the stylesheet was compiled with a compatible LWC version
            checkVersionMismatch(stylesheet, 'stylesheet');
        }
    }
}

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerTemplate(tpl: Template): Template {
    validateTemplateVersion(tpl);
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
