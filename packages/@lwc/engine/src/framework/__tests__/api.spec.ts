/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as api from '../api';
import { createElement, LightningElement, registerDecorators } from '../main';
import { registerTemplate } from '../template';
import { compileTemplate } from 'test-utils';

describe('api', () => {
    afterAll(() => jest.clearAllMocks());

    describe('#c()', () => {
        class Foo extends LightningElement {}

        it('should call the Ctor factory for circular dependencies', () => {
            const factory = function () {
                class Foo extends LightningElement {
                    xyz() {
                        return 1;
                    }
                }
                registerDecorators(Foo, {
                    publicMethods: ['xyz'],
                });
                return Foo;
            };
            factory.__circular__ = true;
            const elm = createElement('x-foo', { is: factory });
            document.body.appendChild(elm);
            expect(elm.xyz()).toBe(1);
        });

        it('should throw if the vnode contains both a computed className and a classMap', () => {
            expect(() => {
                api.c('x-foo', Foo, {
                    className: 'foo',
                    classMap: { foo: true },
                });
            }).toThrowError(/className/);
        });

        it('should throw an error when createElement is called without Ctor', function () {
            expect(() => {
                createElement('x-foo');
            }).toThrow();
        });
    });

    describe('#h()', () => {
        it('should allow null entries in children', () => {
            const vnode = api.h('p', { key: 0 }, [null]);
            expect(vnode.children).toEqual([null]);
        });

        it('should throw for anything other than vnode and null', () => {
            expect(() => {
                api.h('p', { key: 0 }, ['text']);
            }).toThrow();

            expect(() => {
                api.h('p', {}, [undefined]);
            }).toThrow();
        });
    });

    describe('#i()', () => {
        it('should support various types', () => {
            const html = compileTemplate(`<template></template>`);
            class VmRendering extends LightningElement {
                render() {
                    expect(api.i([], () => null)).toEqual([]);
                    expect(api.i(undefined as any, () => null)).toEqual([]);
                    expect(api.i(null as any, () => null)).toEqual([]);
                    return html;
                }
            }
            const elm = createElement('x-vm-aux', { is: VmRendering });
            document.body.appendChild(elm);
        });

        it('should support numeric keys', () => {
            expect(api.i([{ key: 0 }], () => null)).toEqual([null]);
            expect(api.i([{ key: 1 }], () => null)).toEqual([null]);
        });

        it('should provide item and index', () => {
            const o = { x: 1 };
            const vnodes = api.i([o], (item, index) => ({ index, item }));
            expect(vnodes).toEqual([{ index: 0, item: o }]);
        });

        it('should provide correct last value', () => {
            const o = [{ x: 1 }, { x: 2 }, { x: 3 }];
            const vnodes = api.i(o, (item, index, first, last) => last);
            expect(vnodes).toEqual([false, false, true]);
        });

        it('should handle arrays', function () {
            const o = [1, 2];
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should handle Sets', function () {
            const o = new Set();
            o.add(1);
            o.add(2);
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should handle Map', function () {
            const o = new Map();
            o.set('foo', 1);
            o.set('bar', 2);
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['foo,1a', 'bar,2a']);
        });

        it('should handle proxies objects', function () {
            const array = [1, 2];
            const o = new Proxy(array, {});
            const vnodes = api.i(o, (item) => item + 'a');
            expect(vnodes).toEqual(['1a', '2a']);
        });

        it('should log an error when invalid iteration value', () => {
            const html = compileTemplate(`<template></template>`);
            class VmRendering extends LightningElement {
                render() {
                    api.i(undefined as any, () => null);
                    return html;
                }
            }
            const elm = createElement('x-vm-aux', { is: VmRendering });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError('It must be an Array or an iterable Object.');
        });
    });

    describe('#t()', () => {
        it('should produce a text node', () => {
            function html($api) {
                return [$api.h('span', { key: 0 }, [$api.t('miami')])];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('span').textContent).toEqual('miami');
        });
    });

    describe('#k()', () => {
        it('should combine keys', () => {
            let k1, k2;
            function html($api) {
                k1 = $api.k(123, 345);
                k2 = $api.k(345, '678');
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(k1).toEqual('123:345');
            expect(k2).toEqual('345:678');
        });

        it('should throw when key is an object', () => {
            function html($api) {
                $api.k(678, {});
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow('Key must be a string or number.');
        });
    });

    describe('#ti()', () => {
        it('should return 0 when value is not 0 or -1', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(2);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError('This attribute must be set to 0 or -1.');
            expect(normalized).toBe(0);
        });

        it('should return null when value is null', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(null);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(null);
        });

        it('should return undefined when value is undefined', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(undefined);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(undefined);
        });

        it('should return 0 when value is "3"', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti('3');
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError('This attribute must be set to 0 or -1.');
            expect(normalized).toBe(0);
        });

        it('should return -3 when value is -3', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(-3);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(-3);
        });

        it('should return 0 when value is 0', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(0);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(0);
        });

        it('should return -1 when value is -1', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(-1);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(-1);
        });

        it('should return NaN when value is NaN', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(NaN);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(NaN);
        });

        it('should return empty string when value is empty string', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti('');
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe('');
        });

        it('should return true when value is true', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(true);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(true);
        });

        it('should return false when value is false', () => {
            let normalized;
            function html($api) {
                normalized = $api.ti(false);
                return [];
            }
            class Foo extends LightningElement {
                render() {
                    return registerTemplate(html);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(normalized).toBe(false);
        });
    });
});
