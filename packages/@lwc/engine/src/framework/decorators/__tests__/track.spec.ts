/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../main';
import track from '../track';
import readonly from '../readonly';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('track.ts', () => {
    describe('integration', () => {
        it('should support setting a tracked property in constructor', () => {
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
            MyComponent.track = { foo: 1 };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should support tracked properties', () => {
            expect.assertions(2);

            const o = { x: 1 };
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toEqual(o);
                    expect(this.foo).not.toBe(o);
                }
            }
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(o);
        });

        it('should make tracked properties reactive', () => {
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
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo({ x: 2 });
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should make properties of a tracked object property reactive', () => {
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
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFooDotX'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFooDotX(2);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
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
            MyComponent.track = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

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
            MyComponent.track = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

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
            MyComponent.track = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

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
            MyComponent.track = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            const o = Object.create({});
            elm.injectFoo(o);
        });

        it('should not throw an error if track is observable object', function() {
            class MyComponent extends LightningElement {
                injectFoo(v) {
                    this.foo = v;
                }
            }
            MyComponent.track = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.injectFoo({});
            }).not.toThrow();
        });

        it('should throw a track property is mutated during rendering', function() {
            class MyComponent extends LightningElement {
                render() {
                    this.foo = 1;
                    return emptyTemplate;
                }
            }
            MyComponent.track = { foo: {} };
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });
    });

    describe('@track regression', () => {
        test(`#609 - each instance of the same object prototype should have it's own tracked property value`, () => {
            class XFoo extends LightningElement {
                constructor() {
                    super();
                    this.counter = 0;
                }
            }

            XFoo.track = { counter: 0 };

            const elm1 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm1);

            const elm2 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm2);

            const elm1NewVal = 1;
            const elm2NewVal = 2;

            elm1.counter = elm1NewVal;
            elm2.counter = elm2NewVal;

            expect(elm1.counter).toBe(elm1NewVal);
            expect(elm2.counter).toBe(elm2NewVal);
        });
    });

    test(`#609 - instance of the same object prototype should not share values of tracked properties`, () => {
        class XFoo extends LightningElement {
            constructor() {
                super();
                this.counter = 0;
                this.label = 3;
            }
        }

        XFoo.track = { counter: 1, label: 1 };

        const elm1 = createElement('x-foo', { is: XFoo });
        document.body.appendChild(elm1);

        const countVal = 1;
        const labelVal = 4;

        elm1.counter = countVal;
        elm1.label = labelVal;

        expect(elm1.counter).toBe(countVal);
    });

    describe('track()', () => {
        it('should throw when invoking it with more than one argument', () => {
            expect(() => {
                track({}, {});
            }).toThrow();
        });

        it('should throw when attempting to mutate a readonly object via track', () => {
            const o = track(readonly({}));
            expect(() => {
                o.x = 1;
            }).toThrow();
        });

        it('should produce a trackable object', () => {
            let counter = 0;
            const html = compileTemplate(`<template>{foo.bar}</template>`);
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    this.foo = track({ bar: 1 });
                }
                render() {
                    return html;
                }
                renderedCallback() {
                    this.foo.bar = 2;
                    counter += 1;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2); // two rendering phases due to the mutation of this.foo
            });
        });
    });
});
