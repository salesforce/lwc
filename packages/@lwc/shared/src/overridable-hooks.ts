/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as assert from './assert';

export interface SanitizeHtmlContentHook {
    (content: unknown): string;
}

interface OverridableHooks {
    sanitizeHtmlContent: SanitizeHtmlContentHook;
}

let hooksAreSet = false;

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
 * libraries to sanitize HTML content. This hook process the content passed via the template to
 * lwc:inner-html directive.
 * It is meant to be overridden via `setHooks`; it throws an error by default.
 */
export let sanitizeHtmlContent: SanitizeHtmlContentHook = (): string => {
    // locker-service patches this function during runtime to sanitize HTML content.
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

export function setHooks(hooks: OverridableHooks) {
    assert.isFalse(hooksAreSet, 'Hooks are already overridden, only one definition is allowed.');
    hooksAreSet = true;
    sanitizeHtmlContent = hooks.sanitizeHtmlContent;
}
