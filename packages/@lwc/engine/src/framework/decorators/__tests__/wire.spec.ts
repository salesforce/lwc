/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement, registerDecorators } from '../../main';
import wire from '../wire';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('wire.ts', () => {
    describe('integration', () => {
        it('should support setting a wired property in constructor', () => {
            expect.assertions(3);

            const o = { x: 1 };
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    expect('foo' in this).toBe(true);
                    this.foo = o;

                    expect(this.foo).toEqual(o);
                    expect(this.foo).not.toBe(o);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should support wired properties', () => {
            expect.assertions(2);

            const o = { x: 1 };
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toEqual(o);
                    expect(this.foo).not.toBe(o);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(o);
        });

        it('should make wired properties reactive', () => {
            let counter = 0;
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                }
                constructor() {
                    super();
                    this.foo = { x: 1 };
                }
                render() {
                    counter++;
                    this.foo.x;
                    return emptyTemplate;
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo({ x: 2 });

            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should make wired properties as readonly', () => {
            let counter = 0;
            class MyComponent extends LightningElement {
                injectFooDotX(x) {
                    this.foo.x = x;
                }
                constructor() {
                    super();
                    this.foo = { x: 1 };
                }
                render() {
                    counter++;
                    this.foo.x;
                    return emptyTemplate;
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFooDotX'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.injectFooDotX(2);
            }).toThrowError();
            return Promise.resolve().then(() => {
                expect(counter).toBe(1);
            });
        });

        it('should not proxify primitive value', function() {
            expect.assertions(1);

            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(1);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(1);
        });

        it('should proxify plain arrays', function() {
            expect.assertions(2);

            const a = [];
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toEqual(a);
                    expect(this.foo).not.toBe(a);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(a);
        });

        it('should not proxify exotic objects', function() {
            expect.assertions(1);

            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(d);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            const d = new Date();
            elm.injectFoo(d);
        });

        it('should not proxify non-observable object', function() {
            expect.assertions(1);

            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(o);
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            const o = Object.create({});
            elm.injectFoo(o);
        });

        it('should not throw an error if wire is observable object', function() {
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
                publicMethods: ['injectFoo'],
            });
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.injectFoo({});
            }).not.toThrow();
        });

        it('should throw a wire property is mutated during rendering', function() {
            class MyComponent extends LightningElement {
                render() {
                    this.foo = 1;
                    return emptyTemplate;
                }
            }
            registerDecorators(MyComponent, {
                wire: { foo: {} },
            });
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });
    });

    describe('@wire misuse', () => {
        it('should throw when invoking wire without adapter', () => {
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    wire();
                }
            }
            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow('@wire(adapter, config?) may only be used as a decorator.');
        });
    });
});
