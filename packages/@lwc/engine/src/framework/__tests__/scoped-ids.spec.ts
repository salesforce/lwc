/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';

const childHtml = compileTemplate(`<template></template>`);
class MyChild extends LightningElement {
    render() {
        return childHtml;
    }
}

describe('scoped-ids', () => {
    describe('expressions', () => {
        const html = compileTemplate(
            `
            <template>
                <x-child></x-child>
                <div id={identifier}></div>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            }
        );

        describe('custom elements', () => {
            it('should render expected id attribute value when its value is set to `undefined`', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return undefined;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogError(
                    'Invalid id value "undefined". The id attribute must contain a non-empty string.'
                );
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(null);
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return '';
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogError(
                    'Invalid id value "". The id attribute must contain a non-empty string.'
                );
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(null);
            });
        });

        describe('native elements', () => {
            it('should not render id attribute when its value is set to `undefined`', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return undefined;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogError(
                    'Invalid id value "undefined". The id attribute must contain a non-empty string.'
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual(null);
            });

            it('should render the id attribute as a boolean attribute when its value is set to an empty string', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return '';
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                expect(() => {
                    document.body.appendChild(elm);
                }).toLogError(
                    'Invalid id value "". The id attribute must contain a non-empty string.'
                );
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual('');
            });
        });
    });
});
