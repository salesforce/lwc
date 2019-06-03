/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '@lwc/engine';

describe('#childNodes', () => {
    // TODO: issue #xxx move this test to karma, and only test this for synthetic
    it.skip('should always return an empty array for slots not rendering default content', () => {
        const hasSlotTmpl = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class HasSlot extends LightningElement {
            render() {
                return hasSlotTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child-node-with-slot>
                        <p></p>
                    </x-child-node-with-slot>
                </div>
            </template>
        `,
            {
                modules: {
                    'x-child-node-with-slot': HasSlot,
                },
            }
        );
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot
            .querySelector('x-child-node-with-slot')
            .shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(0);
    });

    it('should return correct elements for slots rendering default content', () => {
        const hasSlotTmpl = compileTemplate(`
            <template>
                <slot>
                    <div></div>
                </slot>
            </template>
        `);
        class HasSlot extends LightningElement {
            render() {
                return hasSlotTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child-node-with-slot></x-child-node-with-slot>
                </div>
            </template>
        `,
            {
                modules: {
                    'x-child-node-with-slot': HasSlot,
                },
            }
        );
        class Parent extends LightningElement {
            render() {
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const slot = elm.shadowRoot
            .querySelector('x-child-node-with-slot')
            .shadowRoot.querySelector('slot');
        expect(slot.childNodes).toHaveLength(1);
    });

    it('should return correct elements for non-slot elements', () => {
        const html = compileTemplate(`
            <template>
                <div>
                    <p></p>
                </div>
            </template>
        `);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('div');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('p'));
    });

    it('should return correct elements for custom elements when no children present', () => {
        const childTmpl = compileTemplate(`
            <template>
                <div></div>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child></x-child>
                </div>
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
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct elements for custom elements when children present', () => {
        const childTmpl = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child>
                        <p></p>
                    </x-child>
                </div>
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
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
    });

    it('should return child text content passed via slot', () => {
        const childTmpl = compileTemplate(`
            <template>
                <slot></slot>
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child>
                        text
                    </x-child>
                </div>
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
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(1);
        expect(childNodes[0].nodeType).toBe(3);
        expect(childNodes[0].textContent).toBe('text');
    });

    it('should not return child text from within template', () => {
        const childTmpl = compileTemplate(`
            <template>
                text
            </template>
        `);
        class Child extends LightningElement {
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
            `
            <template>
                <div>
                    <x-child></x-child>
                </div>
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
                return parentTmpl;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const childNodes = child.childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should not return dynamic child text from within template', () => {
        const childTmpl = compileTemplate(`
            <template>
                {dynamicText}
            </template>
        `);
        class Child extends LightningElement {
            get dynamicText() {
                return 'text';
            }
            render() {
                return childTmpl;
            }
        }

        const parentTmpl = compileTemplate(
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
                return parentTmpl;
            }
        }

        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = elm.shadowRoot.querySelector('x-child').childNodes;
        expect(childNodes).toHaveLength(0);
    });

    it('should return correct childNodes from shadowRoot', () => {
        const html = compileTemplate(`
            <template>
                <div></div>
                text
            </template>
        `);
        class Parent extends LightningElement {
            render() {
                return html;
            }
        }

        const elm = createElement('x-child-node-parent', { is: Parent });
        document.body.appendChild(elm);
        const childNodes = elm.shadowRoot.childNodes;
        expect(childNodes).toHaveLength(2);
        expect(childNodes[0]).toBe(elm.shadowRoot.querySelector('div'));
        expect(childNodes[1].nodeType).toBe(3);
        expect(childNodes[1].textContent).toBe('text');
    });
});

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
