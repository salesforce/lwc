/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { template } from '../dom/template';
import { setText, setAttr, setClass, setStyle, setProp } from '../dom/prop';
import { child, nthChild, next } from '../dom/node';

describe('template()', () => {
    test('creates a DOM element from HTML', () => {
        const create = template('<div>hello</div>');
        const el = create() as HTMLElement;
        expect(el.tagName).toBe('DIV');
        expect(el.textContent).toBe('hello');
    });

    test('clones on subsequent calls', () => {
        const create = template('<div>test</div>');
        const el1 = create();
        const el2 = create();
        expect(el1).not.toBe(el2);
        expect((el1 as Element).outerHTML).toBe((el2 as Element).outerHTML);
    });

    test('creates text nodes for non-HTML', () => {
        const create = template('just text');
        const node = create();
        expect(node.nodeType).toBe(Node.TEXT_NODE);
        expect(node.textContent).toBe('just text');
    });

    test('preserves nested structure', () => {
        const create = template('<ul><li>one</li><li>two</li></ul>');
        const el = create() as HTMLElement;
        expect(el.children.length).toBe(2);
        expect(el.children[0].textContent).toBe('one');
        expect(el.children[1].textContent).toBe('two');
    });
});

describe('node traversal', () => {
    test('child() returns first child', () => {
        const create = template('<div><span>first</span><span>second</span></div>');
        const el = create() as HTMLElement;
        const firstChild = child(el) as HTMLElement;
        expect(firstChild.tagName).toBe('SPAN');
        expect(firstChild.textContent).toBe('first');
    });

    test('nthChild() returns nth child', () => {
        const create = template('<div><span>0</span><span>1</span><span>2</span></div>');
        const el = create() as HTMLElement;
        const second = nthChild(el, 1) as HTMLElement;
        expect(second.textContent).toBe('1');
    });

    test('next() returns next sibling', () => {
        const create = template('<div><span>first</span><span>second</span></div>');
        const el = create() as HTMLElement;
        const first = child(el);
        const second = next(first) as HTMLElement;
        expect(second.textContent).toBe('second');
    });
});

describe('setText()', () => {
    test('sets text content', () => {
        const node = document.createTextNode('');
        setText(node, 'hello');
        expect(node.nodeValue).toBe('hello');
    });

    test('caches value to avoid redundant DOM writes', () => {
        // Wrap a text node so we can count writes to nodeValue
        let writeCount = 0;
        const realNode = document.createTextNode('') as Text & { $txt?: string };
        const node = new Proxy(realNode, {
            set(target, key, value) {
                if (key === 'nodeValue') {
                    writeCount++;
                }
                return Reflect.set(target, key, value);
            },
            get(target, key) {
                const value = Reflect.get(target, key);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        }) as Text & { $txt?: string };

        setText(node, 'hello');
        expect(node.$txt).toBe('hello');
        expect(writeCount).toBe(1);

        // Same value should not trigger a second DOM write
        setText(node, 'hello');
        expect(writeCount).toBe(1);

        // Different value triggers a write
        setText(node, 'world');
        expect(writeCount).toBe(2);
    });
});

describe('setAttr()', () => {
    let el: HTMLElement;
    beforeEach(() => {
        el = document.createElement('div');
    });

    test('sets attribute', () => {
        setAttr(el, 'id', 'test');
        expect(el.getAttribute('id')).toBe('test');
    });

    test('removes attribute when value is null', () => {
        el.setAttribute('id', 'test');
        setAttr(el, 'id', null);
        expect(el.hasAttribute('id')).toBe(false);
    });

    test('removes attribute when value is false', () => {
        el.setAttribute('disabled', '');
        setAttr(el, 'disabled', false);
        expect(el.hasAttribute('disabled')).toBe(false);
    });

    test('sets boolean attribute as empty string for true', () => {
        setAttr(el, 'disabled', true);
        expect(el.getAttribute('disabled')).toBe('');
    });
});

describe('setClass()', () => {
    test('sets class from string', () => {
        const el = document.createElement('div');
        setClass(el, 'foo bar');
        expect(el.className).toBe('foo bar');
    });

    test('sets class from object', () => {
        const el = document.createElement('div');
        setClass(el, { active: true, disabled: false, highlight: true });
        expect(el.className).toBe('active highlight');
    });

    test('sets class from array', () => {
        const el = document.createElement('div');
        setClass(el, ['foo', { bar: true, baz: false }]);
        expect(el.className).toBe('foo bar');
    });
});

describe('setStyle()', () => {
    test('sets style from string', () => {
        const el = document.createElement('div');
        setStyle(el, 'color: red; font-size: 14px');
        expect(el.style.color).toBe('red');
        expect(el.style.fontSize).toBe('14px');
    });

    test('ignores non-string style values (string-only, matching LWC)', () => {
        const el = document.createElement('div');
        // Object values for the `style` attribute are invalid in LWC and ignored.
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        setStyle(el, { color: 'blue', fontSize: '16px' } as any);
        expect(el.style.color).toBe('');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    test('clears style when given empty string or null', () => {
        const el = document.createElement('div');
        setStyle(el, 'color: red');
        setStyle(el, '');
        expect(el.getAttribute('style')).toBeNull();
    });
});

describe('setProp()', () => {
    test('sets DOM property', () => {
        const el = document.createElement('input') as HTMLInputElement;
        setProp(el, 'value', 'hello');
        expect(el.value).toBe('hello');
    });

    test('skips redundant writes', () => {
        const el = document.createElement('input') as HTMLInputElement;
        setProp(el, 'value', 'test');
        // Calling again with same value should be a no-op
        setProp(el, 'value', 'test');
        expect(el.value).toBe('test');
    });
});
