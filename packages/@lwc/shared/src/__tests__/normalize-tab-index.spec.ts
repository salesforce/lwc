/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, expect, it } from 'vitest';
import { normalizeTabIndex } from '../normalize-tab-index';

describe('normalize-tab-index', () => {
    it('normalize positive index to 0', () => {
        expect(normalizeTabIndex(1)).toBe(0);
    });
    it('not normalize 0', () => {
        expect(normalizeTabIndex(0)).toBe(0);
    });
    it('not normalize -1', () => {
        expect(normalizeTabIndex(-1)).toBe(-1);
    });
    it('not normalize negative number', () => {
        expect(normalizeTabIndex(-999)).toBe(-999);
    });
    it('not normalize true', () => {
        expect(normalizeTabIndex(true)).toBe(true);
    });
    it('not normalize false', () => {
        expect(normalizeTabIndex(false)).toBe(false);
    });
    it('not normalize null', () => {
        expect(normalizeTabIndex(null)).toBe(null);
    });
    it('not normalize undefined', () => {
        expect(normalizeTabIndex(undefined)).toBe(undefined);
    });
    it('not normalize object', () => {
        const obj = {};
        expect(normalizeTabIndex(obj)).toBe(obj);
    });
    it('normalize string value greater than 1', () => {
        expect(normalizeTabIndex('1')).toBe(0);
    });
    it('not normalize other string values', () => {
        expect(normalizeTabIndex('   ')).toBe('   ');
    });
    it('not normalize string 0', () => {
        expect(normalizeTabIndex('0')).toBe('0');
    });
});
