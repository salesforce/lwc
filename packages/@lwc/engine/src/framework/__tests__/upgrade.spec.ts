/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';

describe('upgrade', () => {
    describe('#createElement()', () => {
        it('should throw an error when options parameter is missing', () => {
            expect(() => {
                createElement('x-foo');
            }).toThrow(
                '"createElement" function expects an object as second parameter but received "undefined".'
            );
        });

        it('should throw an error when options parameter is null', () => {
            expect(() => {
                createElement('x-foo', null);
            }).toThrow(
                '"createElement" function expects an object as second parameter but received "[object Null]".'
            );
        });

        it('should throw an error when "is" value is null', () => {
            expect(() => {
                createElement('x-foo', { is: null});
            }).toThrow(
                '"is" value must be a function but received "[object Null]".'
            );
        });

        it('should throw an error when "is" value is undefined', () => {
            expect(() => {
                createElement('x-foo', { is: undefined});
            }).toThrow(
                '"is" value must be a function but received "undefined".'
            );
        });

        it('should support constructors with circular dependencies', () => {
            const factory = () => class extends LightningElement { };
            factory.__circular__ = true;

            expect(
                () => createElement('x-foo', { is: factory })
            ).not.toThrow();
        });

        it('should allow access to profixied default values for public props', () => {
            const x = [1, 2, 3], y = { foo: 1 };
            type MyComponentElement = HTMLElement & {
                x: any,
                y: any;
            };
            const def = class MyComponent extends LightningElement {
                x: any;
                y: any;
                constructor() {
                    super();
                    this.x = x;
                    this.y = y;
                }

                static publicProps = {
                    x: true,
                    y: true
                };
            };
            const elm: MyComponentElement = createElement('x-foo', { is: def }) as MyComponentElement;
            expect(x).toEqual(elm.x);
            expect(y).toEqual(elm.y);
            expect(elm.x).not.toBe(x);
            expect(elm.y).not.toBe(y);
        });

        it('should proxify any value before setting a property', () => {
            const def = class MyComponent extends LightningElement {};
            def.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: def });
            const o = { foo: 1 };
            elm.x = o;
            expect(o).toEqual(elm.x);
            expect(elm.x).not.toBe(o);
        });

    });

    describe('patches for Element', () => {
        it('should patch querySelector', () => {
            class Root extends LightningElement {
                render() {
                    return compileTemplate(`
                        <template>
                            <p>Paragraph</p>
                        </template>
                    `);
                }
            }

            const el = createElement('x-foo', { is: Root });
            document.body.appendChild(el);
            expect(el.querySelector('p')).toBeNull();
        });

        it('should patch shadowRoot', () => {
            let root
            class Root extends LightningElement {
                connectedCallback() {
                    root = this.template
                }
                render() {
                    return compileTemplate(`
                        <template>
                            <p>Paragraph</p>
                        </template>
                    `);
                }
            }

            const el = createElement('x-foo', { is: Root });
            document.body.appendChild(el);
            expect(el.shadowRoot).toBe(root)
        });
    });
});
