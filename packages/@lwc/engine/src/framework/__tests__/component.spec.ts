/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';

import { createElement, LightningElement } from '../main';

describe('component', function() {
    describe('styles', function() {
        it('should handle string styles', function() {
            let calledCSSText = false;

            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: 'color: red',
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(
                CSSStyleDeclaration.prototype,
                'cssText'
            );
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    calledCSSText = true;
                    return cssTextPropDef.set.call(this, value);
                },
            });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('section').style.cssText).toBe('color: red;');
            expect(calledCSSText).toBe(true);
        });

        it('should handle undefined properly', function() {
            let calledCSSTextWithUndefined = false;

            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: undefined,
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(
                CSSStyleDeclaration.prototype,
                'cssText'
            );
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    if (value === 'undefined') {
                        calledCSSTextWithUndefined = true;
                    }
                    return cssTextPropDef.set.call(this, value);
                },
            });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
            expect(calledCSSTextWithUndefined).toBe(false);
        });

        it('should handle null properly', function() {
            const html = compileTemplate(
                `<template>
                    <section style={state.customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                state = {
                    customStyle: null,
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
        });

        it('should diff between style objects and strings correctly', function() {
            const html = compileTemplate(
                `<template>
                    <section style={customStyle}></section>
                </template>`
            );
            class MyComponent extends LightningElement {
                customStyle: {
                    color: 'red';
                };

                updateStyle() {
                    this.customStyle = 'color:green;';
                }

                render() {
                    return html;
                }
            }

            MyComponent.track = { customStyle: 1 };
            MyComponent.publicMethods = ['updateStyle'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);

            const section = elm.shadowRoot.querySelector('section');

            const removePropertyMock = jest.fn();
            section.style.removeProperty = removePropertyMock;
            const setPropertyMock = jest.fn();
            section.style.setProperty = setPropertyMock;

            elm.updateStyle();
            return Promise.resolve().then(() => {
                expect(removePropertyMock).not.toBeCalled();
                expect(setPropertyMock).toBeCalledWith('color', 'green', '');
            });
        });
    });
});
