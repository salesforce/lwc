/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isUndefined } from '@lwc/shared';
import { logError } from '../shared/logger';
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

let mutationWarningsSilenced = false;

export function setTemplateMutationWarningsSilenced(silenced: boolean) {
    mutationWarningsSilenced = silenced;
}

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerTemplate(tmpl: Template): Template {
    if (process.env.NODE_ENV !== 'production') {
        checkVersionMismatch(tmpl, 'template');
    }
    signedTemplateSet.add(tmpl);

    // TODO [#2782]: For backwards compat, we shim stylesheetTokens on top of stylesheetToken
    // Details: https://salesforce.quip.com/v1rmAFu2cKAr
    defineProperty(tmpl, 'stylesheetTokens', {
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
            if (process.env.NODE_ENV !== 'production') {
                logError(
                    `Dynamically setting the "stylesheetTokens" property on a template function ` +
                        `is deprecated and may be removed in a future version of LWC.`
                );
            }
            // Avoid logging twice (for both stylesheetToken and stylesheetTokens)
            setTemplateMutationWarningsSilenced(true);
            try {
                // If the value is null or some other exotic object, you would be broken anyway in the past
                // because the engine would try to access hostAttribute/shadowAttribute, which would throw an error.
                // However it may be undefined in newer versions of LWC, so we need to guard against that case.
                this.stylesheetToken = isUndefined(value)
                    ? undefined
                    : (value as any).shadowAttribute;
            } finally {
                setTemplateMutationWarningsSilenced(false);
            }
        },
    });

    if (process.env.NODE_ENV !== 'production') {
        // TODO [#2782]: freeze the template function so that dynamically changing these is not possible
        for (const prop of ['stylesheetToken', 'stylesheets'] as const) {
            let value = tmpl[prop];
            defineProperty(tmpl, prop, {
                get() {
                    return value;
                },
                set(newValue) {
                    if (!mutationWarningsSilenced) {
                        logError(
                            `Dynamically setting the "${prop}" property on a template function ` +
                                `is deprecated and may be removed in a future version of LWC.`
                        );
                    }
                    value = newValue;
                },
            });
        }
    }

    // chaining this method as a way to wrap existing
    // assignment of templates easily, without too much transformation
    return tmpl;
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
