/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { normalizeClass } from '../normalize-class';

describe('normalizeClass', () => {
    test('returns undefined for null and undefined', () => {
        expect(normalizeClass(null)).toBeUndefined();
        expect(normalizeClass(undefined)).toBeUndefined();
    });

    test('passes through strings', () => {
        expect(normalizeClass('foo bar')).toBe('foo bar');
    });

    test('joins truthy entries in an array and skips falsy ones', () => {
        expect(normalizeClass(['foo', null, undefined, 'bar', ''])).toBe('foo bar');
    });

    test('recurses into nested arrays', () => {
        expect(normalizeClass(['foo', ['bar', 'baz']])).toBe('foo bar baz');
    });

    test('recurses into objects nested in arrays', () => {
        expect(normalizeClass(['foo', { bar: true }])).toBe('foo bar');
    });

    test('emits object keys whose values are truthy', () => {
        expect(normalizeClass({ foo: true, bar: false, baz: 1, qux: 0 })).toBe('foo baz');
    });

    test('returns an empty string for an empty object', () => {
        expect(normalizeClass({})).toBe('');
    });

    test('returns an empty string for unsupported values', () => {
        expect(normalizeClass(42)).toBe('');
        expect(normalizeClass(true)).toBe('');
    });
});
