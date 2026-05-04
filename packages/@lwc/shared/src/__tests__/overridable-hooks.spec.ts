/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import type * as OverridableHooks from '../overridable-hooks';

// The module keeps a `hooksAreSet` latch at module scope, so reset modules
// before each test to get a fresh, unset instance.
describe('overridable-hooks', () => {
    let mod: typeof OverridableHooks;

    beforeEach(async () => {
        vi.resetModules();
        mod = await import('../overridable-hooks');
    });

    test('throws when sanitizeHtmlContent is called before setHooks', () => {
        expect(() => mod.sanitizeHtmlContent('<p>hi</p>')).toThrow(
            /sanitizeHtmlContent hook must be implemented/
        );
    });

    test('routes sanitizeHtmlContent through the registered hook', () => {
        // vi.fn() retained so we can assert the hook was invoked with the raw input.
        const impl = vi.fn((value: unknown) => `sanitized:${value}`);
        mod.setHooks({ sanitizeHtmlContent: impl });

        expect(mod.sanitizeHtmlContent('<p>hi</p>')).toBe('sanitized:<p>hi</p>');
        expect(impl).toHaveBeenCalledWith('<p>hi</p>');
    });

    test('throws when setHooks is called more than once', () => {
        mod.setHooks({ sanitizeHtmlContent: () => '' });

        expect(() => mod.setHooks({ sanitizeHtmlContent: () => '' })).toThrow(
            /Hooks are already overridden/
        );
    });
});
