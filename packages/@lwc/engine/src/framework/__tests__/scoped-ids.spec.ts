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
                <!--
                    TODO: JSDOM ends up invoking elm.setAttribute('id', value) when setting
                    property values, which we guard against for components by throwing. Add
                    coverage for custom elements when the following issue is resolved:
                    https://github.com/jsdom/jsdom/issues/2158
                -->
                <x-child></x-child>
                <div id={identifier}></div>
            </template>
        `,
            {
                modules: { 'x-child': MyChild },
            }
        );

        describe.skip('custom elements', () => {
            it('should render a transformed id attribute when its value is set to a non-empty string', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return 'foo';
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(expect.stringContaining('foo'));
            });

            it('should render a transformed id attribute when its value is set to a boolean value', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return true;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(expect.stringContaining('true'));
            });

            it('should not render id attribute when its value is set to `null`', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return null;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual(null);
            });

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
                }).toLogError('Invalid id value "undefined". Expected a non-empty string.');
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual('undefined');
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
                }).toLogError('Invalid id value "". Expected a non-empty string.');
                const child = elm.shadowRoot.querySelector('x-child');
                expect(child.getAttribute('id')).toEqual('');
            });
        });

        describe('native elements', () => {
            it('should render a transformed id attribute when its value is set to a non-empty string', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return 'foo';
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual(expect.stringContaining('foo'));
            });

            it('should render a transformed id attribute when its value is set to a boolean value', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return true;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual(expect.stringContaining('true'));
            });

            it('should not render id attribute when its value is set to `null`', () => {
                class MyComponent extends LightningElement {
                    get identifier() {
                        return null;
                    }
                    render() {
                        return html;
                    }
                }

                const elm = createElement('x-foo', { is: MyComponent });
                document.body.appendChild(elm);
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual(null);
            });

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
                }).toLogError('Invalid id value "undefined". Expected a non-empty string.');
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
                }).toLogError('Invalid id value "". Expected a non-empty string.');
                const div = elm.shadowRoot.querySelector('div');
                expect(div.getAttribute('id')).toEqual('');
            });
        });
    });
});
