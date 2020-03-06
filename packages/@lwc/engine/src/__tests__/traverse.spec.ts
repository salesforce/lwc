/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../';

describe('assignedSlot', () => {
    it('should return null when custom element is not in slot', () => {
        class NoSlot extends LightningElement {}

        const html = compileTemplate(
            `
            <template>
                <x-assigned-slot-child></x-assigned-slot-child>
            </template>
        `,
            {
                modules: {
                    'x-assigned-slot-child': NoSlot,
                },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-assigned-slot-child');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when native element is not in slot', () => {
        const html = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when native element is slotted', () => {
        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(
            `
            <template>
                <x-native-slotted-component-child>
                    <div>
                        test
                    </div>
                </x-native-slotted-component-child>
            </template>
        `,
            {
                modules: {
                    'x-native-slotted-component-child': WithSlot,
                },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot
            .querySelector('x-native-slotted-component-child')
            .shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return correct slot when custom element is slotted', () => {
        class InsideSlot extends LightningElement {}

        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(
            `
            <template>
                <x-native-slotted-component-child>
                    <x-inside-slot></x-inside-slot>
                </x-native-slotted-component-child>
            </template>
        `,
            {
                modules: {
                    'x-native-slotted-component-child': WithSlot,
                    'x-inside-slot': InsideSlot,
                },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot
            .querySelector('x-native-slotted-component-child')
            .shadowRoot.querySelector('slot');
        const child = elm.shadowRoot.querySelector('x-inside-slot');
        expect(child.assignedSlot).toBe(slot);
    });

    it('should return null when native element default slot content', () => {
        const html = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return null when custom element default slot content', () => {
        class CustomElement extends LightningElement {}

        const html = compileTemplate(
            `
            <template>
                <slot>
                    <x-default-slot-custom-element></x-default-slot-custom-element>
                </slot>
            </template>
        `,
            {
                modules: {
                    'x-default-slot-custom-element': CustomElement,
                },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-assigned-slot', { is: MyComponent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-default-slot-custom-element');
        expect(child.assignedSlot).toBe(null);
    });

    it('should return correct slot when text is slotted', () => {
        const slottedHtml = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class WithSlot extends LightningElement {
            render() {
                return slottedHtml;
            }
        }

        const html = compileTemplate(
            `
            <template>
                <x-native-slotted-component-child>
                    text
                </x-native-slotted-component-child>
            </template>
        `,
            {
                modules: {
                    'x-native-slotted-component-child': WithSlot,
                },
            }
        );
        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-native-slotted-component', { is: MyComponent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot
            .querySelector('x-native-slotted-component-child')
            .shadowRoot.querySelector('slot');
        const text = elm.shadowRoot.querySelector('x-native-slotted-component-child').childNodes[0];
        expect(text.assignedSlot).toBe(slot);
    });
});
