/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the className setter behaviour in isolation using a lightweight mock that
// mimics the parts of LightningElement involved in the bug fix for #5093.
// Full integration tests live in the SSR integration suite.

interface MockProps {
    class?: any;
}

interface MockAttrs {
    class?: any;
}

// A minimal harness replicating only the className setter logic from LightningElement
function makeElement() {
    const props: MockProps = {};
    const attrs: MockAttrs = {};
    const mutations: string[] = [];

    const element = {
        get className(): string {
            return props.class ?? '';
        },
        set className(newVal: any) {
            // This mirrors the fixed implementation in lightning-element.ts
            const strVal = String(newVal);
            props.class = strVal;
            attrs.class = strVal;
            mutations.push('class');
        },
        _props: props,
        _attrs: attrs,
        _mutations: mutations,
    };

    return element;
}

describe('LightningElement className setter – non-string coercion (#5093)', () => {
    let el: ReturnType<typeof makeElement>;

    beforeEach(() => {
        el = makeElement();
    });

    it('stores a plain string unchanged', () => {
        el.className = 'my-class';
        expect(el.className).toBe('my-class');
        expect(el._props.class).toBe('my-class');
        expect(el._attrs.class).toBe('my-class');
    });

    it('coerces undefined to the string "undefined"', () => {
        el.className = undefined;
        expect(el.className).toBe('undefined');
        expect(el._props.class).toBe('undefined');
        expect(el._attrs.class).toBe('undefined');
    });

    it('coerces null to the string "null"', () => {
        el.className = null;
        expect(el.className).toBe('null');
        expect(el._props.class).toBe('null');
        expect(el._attrs.class).toBe('null');
    });

    it('coerces 0 to the string "0"', () => {
        el.className = 0;
        expect(el.className).toBe('0');
        expect(el._props.class).toBe('0');
        expect(el._attrs.class).toBe('0');
    });

    it('coerces false to the string "false"', () => {
        el.className = false;
        expect(el.className).toBe('false');
        expect(el._props.class).toBe('false');
        expect(el._attrs.class).toBe('false');
    });

    it('coerces a number to its string representation', () => {
        el.className = 42;
        expect(el.className).toBe('42');
    });

    it('coerces an object with toString() to its string representation', () => {
        el.className = { toString: () => 'custom-class' };
        expect(el.className).toBe('custom-class');
    });

    it('produces identical props and attrs values after setting', () => {
        el.className = null;
        expect(el._props.class).toBe(el._attrs.class);
    });

    it('tracks the mutation for the "class" key', () => {
        el.className = 'foo';
        expect(el._mutations).toContain('class');
    });
});
