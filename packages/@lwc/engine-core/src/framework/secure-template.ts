/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isUndefined } from '@lwc/shared';
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

    // FIXME[@W-10950976]: the template object should be frozen, and it should not be possible to set
    // the stylesheets or stylesheetToken(s). For backwards compat, though, we shim stylesheetTokens
    // on top of stylesheetToken for anyone who is accessing the old internal API.
    // Details: https://salesforce.quip.com/v1rmAFu2cKAr
    defineProperty(tpl, 'stylesheetTokens', {
        get() {
            const { stylesheetToken } = this;
            if (isUndefined(stylesheetToken)) {
                return stylesheetToken;
            }
            // Shim for the old `stylesheetTokens` property
            // See https://github.com/salesforce/lwc/pull/2332/files#diff-7901555acef29969adaa6583185b3e9bce475cdc6f23e799a54e0018cb18abaa
            return {
                hostAttribute: `${stylesheetToken}-host`,
                shadowAttribute: stylesheetToken,
            };
        },

        set(value) {
            // If the value is null or some other exotic object, you would be broken anyway in the past
            // because the engine would try to access hostAttribute/shadowAttribute, which would throw an error.
            // However it may be undefined in newer versions of LWC, so we need to guard against that case.
            this.stylesheetToken = isUndefined(value) ? undefined : (value as any).shadowAttribute;
        },
    });

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
