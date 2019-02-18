/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import target from '../props';

describe('module/props', () => {
    it('should not set the input element title when the new value matches the old value from diffing (reconciliation)', () => {
        const elm = {};
        let read = 0;
        Object.defineProperty(elm, 'title', {
            get: () => {
                read += 1;
                return 'internal title';
            },
            set: () => {
                throw new Error('setter for input.title was called accidentally');
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { sel: 'input', data: { props: { title: 'new title' } } };
        const newVnode = { sel: 'input', data: { props: { title: 'new title' } }, elm };

        target.update(oldVnode, newVnode);
        expect(read).toBe(0);
        expect(elm.title).toBe('internal title');
    });

    it('should set the input element value when the new value matches if it is not match the elm.value (especial reconciliation)', () => {
        const elm = {};
        Object.defineProperty(elm, 'value', {
            value: 'old value',
            enumerable: true,
            writable: true,
        });
        const oldVnode = { sel: 'input', data: { props: { value: 'new value' } } };
        const newVnode = { sel: 'input', data: { props: { value: 'new value' } }, elm };

        expect(elm.value).toBe('old value');
        // value PropertyKey is considered especial, and even if the old tracked value is equal to the new tracked value
        // we still check against the element's corresponding value to be sure.
        target.update(oldVnode, newVnode);
        expect(elm.value).toBe('new value');
    });

    it('should set the input element checked when the new checked matches if it is not match the elm.checked (especial reconciliation)', () => {
        const elm = {};
        Object.defineProperty(elm, 'checked', {
            value: 'old checked',
            enumerable: true,
            writable: true,
        });
        const oldVnode = { sel: 'input', data: { props: { checked: 'new checked' } } };
        const newVnode = { sel: 'input', data: { props: { checked: 'new checked' } }, elm };

        expect(elm.checked).toBe('old checked');
        // checked PropertyKey is considered especial, and even if the old tracked value is equal to the new tracked value
        // we still check against the element's corresponding value to be sure.
        target.update(oldVnode, newVnode);
        expect(elm.checked).toBe('new checked');
    });

    it('should set the input element value when the new value does not match (reconciliation)', () => {
        const elm = {};
        let v = 'user input';
        Object.defineProperty(elm, 'value', {
            get: () => {
                return v;
            },
            set: value => {
                v = value;
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { sel: 'input', data: { props: { value: 'old value' } } };
        const newVnode = { sel: 'input', data: { props: { value: 'new value' } }, elm };

        target.update(oldVnode, newVnode);
        expect(v).toBe('new value');
        expect(elm.value).toBe('new value');
    });

    it('should set the textarea element value when the new value does not match (reconciliation)', () => {
        const elm = {};
        let v = 'user input';
        Object.defineProperty(elm, 'value', {
            get: () => {
                return v;
            },
            set: value => {
                v = value;
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { sel: 'textarea', data: { props: { value: 'old value' } } };
        const newVnode = { sel: 'textarea', data: { props: { value: 'new value' } }, elm };

        target.update(oldVnode, newVnode);
        expect(v).toBe('new value');
        expect(elm.value).toBe('new value');
    });

    it('should set the select element value when the new value does not match (reconciliation)', () => {
        const elm = {};
        let v = 'user input';
        Object.defineProperty(elm, 'value', {
            get: () => {
                return v;
            },
            set: value => {
                v = value;
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { sel: 'select', data: { props: { value: 'old value' } } };
        const newVnode = { sel: 'select', data: { props: { value: 'new value' } }, elm };

        target.update(oldVnode, newVnode);
        expect(v).toBe('new value');
        expect(elm.value).toBe('new value');
    });

    it('should set the input element value when the new value does not match (reconciliation)', () => {
        const elm = {};
        let v = 'user input';
        Object.defineProperty(elm, 'value', {
            get: () => {
                return v;
            },
            set: value => {
                v = value;
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { value: 'old value' } } };
        const newVnode = { data: { props: { value: 'new value' } }, elm };

        target.update(oldVnode, newVnode);
        expect(v).toBe('new value');
        expect(elm.value).toBe('new value');
    });

    it('should not touch the element when the values are the same', () => {
        const elm = document.createElement('div');
        Object.defineProperty(elm, 'foo', {
            get: () => {
                throw new Error('getter for element.foo was called accidentally');
            },
            set: () => {
                throw new Error('setter for element.foo was called accidentally');
            },
            configurable: false,
            enumerable: true,
        });
        const oldVnode = { data: { props: { foo: 1 } } };
        const newVnode = { data: { props: { foo: 1 } }, elm };

        target.update(oldVnode, newVnode);
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
    });

    it('should allow undefined value in props', () => {
        const elm = document.createElement('div');
        elm.foo = null;
        const oldVnode = { data: { props: { foo: null } } };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
    });

    it('should prevent deleting element when a falsy value will be added', () => {
        const elm = document.createElement('div');
        Object.defineProperty(elm, 'foo', {
            value: 1,
            configurable: false,
            writable: true,
            enumerable: true,
        });
        elm.foo = 1;
        const oldVnode = { data: { props: { foo: 1 } } };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        expect(Object.getOwnPropertyDescriptor(newVnode.elm, 'foo')).not.toBeUndefined();
        expect(newVnode.elm.foo).toBeUndefined();
    });

    it('should consider initially undefined values', () => {
        const elm = document.createElement('div');
        elm.foo = 1;
        const oldVnode = { data: {} };
        const newVnode = { data: { props: { foo: undefined } }, elm };

        target.update(oldVnode, newVnode);
        expect(newVnode.elm.foo).toBeUndefined();
    });
});
