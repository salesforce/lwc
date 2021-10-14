/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
 * libraries to sanitize HTML content. This hook process the content passed via the template to
 * lwc:inner-html directive.
 * It is meant to be overridden with setSanitizeHtmlContentHook
 */
export let sanitizeHtmlContentHook: SanitizeHtmlContentHook = (): string => {
    // locker-service patches this function during runtime to sanitize HTML content.
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

export type SanitizeHtmlContentHook = (content: unknown) => string;

/**
 * Sets the sanitizeHtmlContentHook.
 *
 * @param newHookImpl
 * @returns oldHookImplementation.
 */
export function setSanitizeHtmlContentHook(
    newHookImpl: SanitizeHtmlContentHook
): SanitizeHtmlContentHook {
    const currentHook = sanitizeHtmlContentHook;

    sanitizeHtmlContentHook = newHookImpl;

    return currentHook;
}
