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
const WireAdapter = class EchoWireAdapter {
    update() {}
    connect() {}
    disconnect() {}
};

describe('wire.ts', () => {
    describe('integration', () => {
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
                wire: {
                    foo: {
                        adapter: WireAdapter,
                        config: function() {
                            return {};
                        },
                    },
                },
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

        it('should throw if wire adapter is not truthy', () => {
            class MyComponent extends LightningElement {}

            expect(() => {
                registerDecorators(MyComponent, {
                    wire: {
                        foo: {},
                    },
                });
            }).toThrow('Assert Violation: @wire on field "foo": adapter id must be truthy.');
        });
    });
});
