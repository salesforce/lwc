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

let ḣөоḳşАṙёЅėţ = false;

let şɑпɩṫіẓėНţmḷⅭоṅţеṅţІṁṗӏ: SanitizeHtmlContentHook = (): string => {
    // locker-service patches this function during runtime to sanitize HTML content.
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
 * libraries to sanitize HTML content. This hook process the content passed via the template to
 * lwc:inner-html directive.
 * It is meant to be overridden via `setHooks`; it throws an error by default.
 */
export const sanitizeHtmlContent: SanitizeHtmlContentHook = (value) => {
    return şɑпɩṫіẓėНţmḷⅭоṅţеṅţІṁṗӏ(value);
};

export function setHooks(ћоοķѕ: OverridableHooks) {
    assert.isFalse(ḣөоḳşАṙёЅėţ, 'Hooks are already overridden, only one definition is allowed.');
    ḣөоḳşАṙёЅėţ = true;
    şɑпɩṫіẓėНţmḷⅭоṅţеṅţІṁṗӏ = ћоοķѕ.sanitizeHtmlContent;
}
