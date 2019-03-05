/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

describe('accessibility', () => {
    describe('focus()', () => {
        describe('for delegatesFocus=true', () => {
            it('should place the focus on the first focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <input>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    renderedCallback() {
                        this.template.querySelector('input').focus();
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(
                        elm.shadowRoot.querySelector('input')
                    );
                });
            });

            it('should place the focus on the first focusable child even if it is multiple levels down', () => {
                const childHTML = compileTemplate(`
                    <template>
                        <input>
                    </template>
                `);
                class Child extends LightningElement {
                    render() {
                        return childHTML;
                    }
                    renderedCallback() {
                        this.template.querySelector('input').focus();
                    }
                }
                const parentHTML = compileTemplate(
                    `
                    <template>
                        <x-child></x-child>
                    </template>
                `,
                    {
                        modules: {
                            'x-child': Child,
                        },
                    }
                );
                class Parent extends LightningElement {
                    render() {
                        return parentHTML;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Parent });
                document.body.appendChild(elm);
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(
                        elm.shadowRoot.querySelector('x-child')
                    );
                    expect(elm.shadowRoot.activeElement.shadowRoot.activeElement).toBe(
                        elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('input')
                    );
                });
            });

            it('should do nothing if it already have a activeElement selected', () => {
                const html = compileTemplate(`
                    <template>
                        <input class="uno">
                        <input class="dos">
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                const dos = elm.shadowRoot.querySelector('input.dos');
                // focussing on the second input before attempting to set the focus on the host
                dos.focus();
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    elm.focus();
                    return Promise.resolve().then(() => {
                        // jsdom has some timing issues with the manual focusing process
                        expect(elm.shadowRoot.activeElement).toBe(dos);
                    });
                });
            });

            it('should blur the activeElement child', () => {
                const html = compileTemplate(`
                    <template>
                        <input>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                const input = elm.shadowRoot.querySelector('input');
                // focussing on the input before attempting to blur the host
                input.focus();
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    elm.blur();
                    return Promise.resolve().then(() => {
                        // jsdom has some timing issues with the manual focusing process
                        expect(elm.shadowRoot.activeElement).toBe(null);
                    });
                });
            });
            it('should do nothing when tabindex is -1 and the focus is set programmatically', () => {
                const html = compileTemplate(`
                    <template>
                        <input>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                elm.tabIndex = -1;
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.tabIndex).toBe(-1);
                    expect(elm.shadowRoot.activeElement).toBe(null);
                });
            });
            it('should focus on itself when there is no focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <div></div>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                elm.tabIndex = 0;
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(null);
                    expect(document.activeElement).toBe(elm);
                });
            });
            it('should return tabIndex=0 as the default value for custom element', () => {
                const html = compileTemplate(`
                    <template>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    static delegatesFocus = true;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                expect(elm.tabIndex).toBe(0);
            });
        });

        describe('for delegatesFocus=false', () => {
            it('should not delegate the focus to the first focusable child', () => {
                const html = compileTemplate(`
                    <template>
                        <input>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                    // static delegatesFocus = false;
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                elm.focus();
                return Promise.resolve().then(() => {
                    // jsdom has some timing issues with the manual focusing process
                    expect(elm.shadowRoot.activeElement).toBe(null);
                });
            });
            it('should return tabIndex=-1 as the default value for custom element', () => {
                const html = compileTemplate(`
                    <template>
                    </template>
                `);
                class Foo extends LightningElement {
                    constructor() {
                        super();
                    }
                    render() {
                        return html;
                    }
                }
                const elm = createElement('x-parent', { is: Foo });
                document.body.appendChild(elm);
                expect(elm.tabIndex).toBe(-1);
            });
        });
    });
});
