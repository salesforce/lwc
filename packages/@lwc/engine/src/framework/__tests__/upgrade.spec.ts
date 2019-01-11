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
                '"createElement" function was invoked with invalid second parameter "undefined". ' +
                'Expected an object that contains property "is" mapped to an object that extends LightningElement from "lwc".'
            );
        });

        it('should throw an error when options parameter is null', () => {
            expect(() => {
                createElement('x-foo', null);
            }).toThrow(
                '"createElement" function was invoked with invalid second parameter "null". ' +
                'Expected an object that contains property "is" mapped to an object that extends LightningElement from "lwc".'
            );
        });

        it('should throw an error when "is" value is null', () => {
            expect(() => {
                createElement('x-foo', { is: null});
            }).toThrow(
                '"createElement" function was invoked with invalid second parameter. "is" property value was "null", ' +
                'but expected an object that extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.'
            );
        });

        it('should throw an error when "is" value is undefined', () => {
            expect(() => {
                createElement('x-foo', { is: undefined});
            }).toThrow(
                '"createElement" function was invoked with invalid second parameter. "is" property value was "undefined", ' +
                'but expected an object that extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.'
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

    describe('patches for Node.', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('appendChild()', () => {
            const el = document.createElement('div');
            expect(document.body.appendChild(el)).toBe(el);
            expect(el.parentNode).toBe(document.body);
        });

        it('insertBefore()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            expect(document.body.insertBefore(el, anchor)).toBe(el);
            expect(document.body.firstChild).toBe(el);
        });

        it('removeChild()', () => {
            const el = document.createElement('div');
            document.body.appendChild(el);
            expect(document.body.removeChild(el)).toBe(el);
            expect(el.parentNode).toBeNull();
        });

        it('replaceChild()', () => {
            const el = document.createElement('div');
            const anchor = document.createElement('p');
            document.body.appendChild(anchor);
            expect(document.body.replaceChild(el, anchor)).toBe(anchor);
            expect(document.body.childNodes[0]).toBe(el);
            expect(document.body.childNodes.length).toBe(1);
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
