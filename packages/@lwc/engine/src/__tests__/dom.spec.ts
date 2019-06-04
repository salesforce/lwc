/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../';

describe('dom', () => {
    describe('composed polyfill', () => {
        it('should get native events as composed true', function() {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('click', function(e) {
                expect(e.composed).toBe(true);
            });
            elm.click();
        });

        it('should get custom events as composed false', function() {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('bar', function(e) {
                expect(e.composed).toBe(false);
            });
            elm.dispatchEvent(new CustomEvent('bar', {}));
        });

        it('should allow customization of composed init in custom events', function() {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('foo', function(e) {
                expect(e.composed).toBe(true);
            });
            elm.dispatchEvent(new CustomEvent('foo', { composed: true }));
        });

        it('should handle event.target on events dispatched on custom elements', function() {
            expect.assertions(1);
            class MyComponent extends LightningElement {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            const parentTmpl = compileTemplate(
                `
                <template>
                    <x-foo onfoo={handleFoo}></x-foo>
                </template>
            `,
                {
                    modules: {
                        'x-foo': MyComponent,
                    },
                }
            );
            class Parent extends LightningElement {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('x-foo');
            child.trigger();
        });
    });
});
