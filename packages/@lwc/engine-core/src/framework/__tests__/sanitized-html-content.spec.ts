/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
// Importing `@lwc/features` for its side effect: it defines the ambient `lwcRuntimeFlags`
// global that `sanitized-html-content.ts` reads.
import { setFeatureFlagForTest } from '@lwc/features';
import {
    createSanitizedHtmlContent,
    safelySetProperty,
    unwrapIfNecessary,
} from '../sanitized-html-content';

const FLAG = 'DISABLE_SANITIZED_HTML_CONTENT_IDENTITY_CHECK';

// W-23680734: an object whose property semantics are caller-controlled. The legacy brand check
// relied on `symbol in value` and `value[symbol]`, which for such an object resolve to whatever
// its `has`/`get` handlers return — so it could report the sanitized-content brand it does not
// legitimately hold. This stand-in models exactly that: `in` reports true, and any read returns
// the (benign, marker-only) string below. The identity brand must not be fooled by it.
const UNTRUSTED_MARKUP = '<span data-untrusted></span>';
function makeBrandForgingObject(markup: string = UNTRUSTED_MARKUP) {
    return new Proxy(
        {},
        {
            has() {
                return true;
            },
            get() {
                return markup;
            },
        }
    );
}

describe('sanitized-html-content', () => {
    afterEach(() => {
        // Reset the kill-switch between tests (non-production allows re-setting).
        setFeatureFlagForTest(FLAG, false);
        vi.restoreAllMocks();
    });

    describe('default (identity brand) — the fix', () => {
        it('round-trips a legitimately-created sanitized value', () => {
            const wrapper = createSanitizedHtmlContent('<b>ok</b>');
            expect(unwrapIfNecessary(wrapper)).toBe('<b>ok</b>');
        });

        it('sets innerHTML for a legitimately-created sanitized value', () => {
            const setProperty = vi.fn();
            const elm = {} as Element;
            const wrapper = createSanitizedHtmlContent('<b>ok</b>');
            safelySetProperty(setProperty, elm, 'innerHTML', wrapper);
            expect(setProperty).toHaveBeenCalledWith(elm, 'innerHTML', '<b>ok</b>');
        });

        it('does NOT trust a brand-forging object (unwrap returns it unchanged, not its markup)', () => {
            const obj = makeBrandForgingObject();
            // It is not a real sanitized-content object → it is returned as-is, never unwrapped
            // to the untrusted string.
            expect(unwrapIfNecessary(obj)).toBe(obj);
        });

        it('does NOT pass a brand-forging object through to innerHTML (W-23680734)', () => {
            const setProperty = vi.fn();
            const elm = {} as Element;
            const obj = makeBrandForgingObject();
            safelySetProperty(setProperty, elm, 'innerHTML', obj);
            // The renderer must never be driven to write the untrusted string.
            expect(setProperty).not.toHaveBeenCalledWith(
                elm,
                'innerHTML',
                expect.stringContaining('data-untrusted')
            );
            // And in particular it must not be called at all for the untrusted value.
            expect(setProperty).not.toHaveBeenCalled();
        });

        it('does NOT pass a brand-forging object through to outerHTML either', () => {
            const setProperty = vi.fn();
            const elm = {} as Element;
            safelySetProperty(setProperty, elm, 'outerHTML', makeBrandForgingObject());
            expect(setProperty).not.toHaveBeenCalled();
        });

        it('is not fooled by an object that merely copies a real wrapper (own-symbol) — identity, not shape', () => {
            const real = createSanitizedHtmlContent('<b>ok</b>');
            // Copy every own property (incl. the symbol) onto a fresh object.
            const lookalike = Object.create(null, Object.getOwnPropertyDescriptors(real as object));
            // The lookalike has the symbol but was never registered by us → not trusted.
            expect(unwrapIfNecessary(lookalike)).toBe(lookalike);
        });
    });

    // `setFeatureFlagForTest` is a no-op in production (flags can't be toggled there), so these
    // kill-switch assertions are only meaningful in non-production. Same guard idiom as
    // `engine-dom/.../formatters/__tests__/component.spec.ts`.
    describe.skipIf(process.env.NODE_ENV === 'production')(
        'kill-switch enabled (legacy structural brand)',
        () => {
            it('restores the legacy symbol brand so the legit path still works', () => {
                setFeatureFlagForTest(FLAG, true);
                const wrapper = createSanitizedHtmlContent('<b>ok</b>');
                expect(unwrapIfNecessary(wrapper)).toBe('<b>ok</b>');
            });

            it('reverts to the legacy structural behavior — proving the flag is a real kill-switch', () => {
                setFeatureFlagForTest(FLAG, true);
                const obj = makeBrandForgingObject();
                // With the legacy structural check, a brand-forging object is (undesirably)
                // trusted. This asserts the flag genuinely toggles behavior; the default (flag
                // off) is safe.
                expect(unwrapIfNecessary(obj)).toBe(UNTRUSTED_MARKUP);
            });
        }
    );

    describe('non-object inputs are passed through unchanged (both modes)', () => {
        it.each([null, undefined, 'a string', 42, true])('%s', (value) => {
            expect(unwrapIfNecessary(value)).toBe(value);
        });
    });
});
