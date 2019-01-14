/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from "../../framework/main";

interface LightningSlotElement extends HTMLSlotElement {
    assignedElements(options?: object): Element[];
}

// https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element
describe('assignedNodes and assignedElements', () => {
    describe('slots default content', () => {
        // Initialized before each test
        let element;

        const html = compileTemplate(`
            <template>
                <slot>
                    foo
                    <div></div>
                    bar
                </slot>
            </template>
        `);

        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        beforeEach(() => {
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables (assignedNodes)', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('slot') as LightningSlotElement;
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should not find any slotables (assignedElements)', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('slot') as LightningSlotElement;
            expect(slot.assignedElements()).toHaveLength(0);
        });

        it('should find flattened slotables (assignedNodes)', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('slot') as LightningSlotElement;
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(3);
            expect(assigned[1].tagName).toBe('DIV');
        });

        it('should find flattened slotables (assignedElements)', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('slot') as LightningSlotElement;
            const assigned = slot.assignedElements({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('nested slots default content', () => {
        // Initialized before each test
        let element;

        const html = compileTemplate(`
            <template>
                <slot name="outer">
                    <slot name="inner">
                        <div></div>
                    </slot>
                </slot>
            </template>
        `);

        class MyComponent extends LightningElement {
            render() {
                return html;
            }
        }

        beforeEach(() => {
            element = createElement('x-assigned-nodes', { is: MyComponent });
        });

        it('should not find any slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should not find any slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
            expect(slot.assignedNodes()).toHaveLength(0);
        });

        it('should find flattened slotables for the outer slot', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });

        it('should find flattened slotables for the inner slot', () => {
            document.body.appendChild(element);
            const slot = element.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
            const assigned = slot.assignedNodes({ flatten: true });
            expect(assigned).toHaveLength(1);
            expect(assigned[0].tagName).toBe('DIV');
        });
    });

    describe('nested slots assigned content', () => {
        describe('when slotable assigned to outer slot', () => {
            // Initialized before each test
            let element;

            const childHtml = compileTemplate(`
                <template>
                    <slot name="outer">
                        <slot name="inner">
                            <div></div>
                        </slot>
                    </slot>
                </template>
            `);

            class AssignedNodesChild extends LightningElement {
                render() {
                    return childHtml;
                }
            }

            const parentHtml = compileTemplate(`
                <template>
                    <x-assigned-nodes-child>
                        <p slot="outer"></p>
                    </x-assigned-nodes-child>
                </template>
            `, {
                modules: { 'x-assigned-nodes-child': AssignedNodesChild }
            });

            class AssignedNodesParent extends LightningElement {
                render() {
                    return parentHtml;
                }
            }

            beforeEach(() => {
                element = createElement('x-assigned-nodes', { is: AssignedNodesParent });
            });

            it('should find the slotable for the outer slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should not find any slotable for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find assigned content for the outer slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it.skip('should find default content for the inner slot', () => {
                // not possible in fallback mode because if the content of the outer is
                // slotted correctly, its fallback with the inner is not going to be added
                // to the dom.
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('DIV');
            });
        });

        describe('when slotable assigned to inner slot', () => {
            // Initialized before each test
            let element;

            const childHtml = compileTemplate(`
                <template>
                    <slot name="outer">
                        <slot name="inner">
                            <div></div>
                        </slot>
                    </slot>
                </template>
            `);

            class AssignedNodesChild extends LightningElement {
                render() {
                    return childHtml;
                }
            }

            const parentHtml = compileTemplate(`
                <template>
                    <x-assigned-nodes-child>
                        <p slot="inner"></p>
                    </x-assigned-nodes-child>
                </template>
            `, {
                modules: { 'x-assigned-nodes-child': AssignedNodesChild }
            });

            class AssignedNodesParent extends LightningElement {
                render() {
                    return parentHtml;
                }
            }

            beforeEach(() => {
                element = createElement('x-assigned-nodes', { is: AssignedNodesParent });
            });

            it('should not find any slotable for the outer slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(0);
            });

            it('should find the slotable for the inner slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes();
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find default content for the outer slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="outer"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });

            it('should find assigned content for the inner slot', () => {
                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-assigned-nodes-child');
                const slot = child.shadowRoot.querySelector('[name="inner"]') as LightningSlotElement;
                const assigned = slot.assignedNodes({ flatten: true });
                expect(assigned).toHaveLength(1);
                expect(assigned[0].tagName).toBe('P');
            });
        });
    });
});

describe('slot.name', () => {
    describe('in fallback', () => {

        it('should resolve the right property name on every slot', () => {
            let element;

            const html = compileTemplate(`
                <template>
                    <slot>
                        <h1></h1>
                    </slot>
                    <slot name="foo">
                        <h2></h2>
                    </slot>
                </template>
            `);

            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            element = createElement('x-assigned-nodes', { is: MyComponent });
            document.body.appendChild(element);
            const slots = element.shadowRoot.querySelectorAll('slot');
            expect(slots.length).toBe(2);
            expect(slots[0].name).toBe('');
            expect(slots[1].name).toBe('foo');
            expect(slots[0].getAttribute('name')).toBe(null);
            expect(slots[1].getAttribute('name')).toBe('foo');
        });

    });
});

describe('slotted elements', () => {
    it('should be visible via event.target', () => {
        expect.assertions(5);

        const htmlChild = compileTemplate(`
            <template>
                <button>click me</button>
            </template>
        `);

        class XChild extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickOnChild.bind(this));
            }
            render() {
                return htmlChild;
            }
            handleClickOnChild(e) {
                expect(e.target).toBe(this.template.querySelector('button'));
            }
        }

        const htmlContainer = compileTemplate(`
            <template>
                <slot onclick={handleClickInSlot}></slot>
            </template>
        `);

        class XContainer extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickInContainer.bind(this));
            }
            render() {
                return htmlContainer;
            }
            handleClickInContainer(e) {
                expect(e.target).toBe(this.querySelector('x-child'));
            }
            handleClickInSlot(e) {
                expect(e.target).toBe(this.querySelector('x-child'));
                expect(e.currentTarget).toBe(this.template.querySelector('slot'));
            }
        }

        const htmlMock = compileTemplate(`
            <template>
                <x-container>
                    <x-child></x-child>
                </x-container>
            </template>
        `, {
            modules: {
                'x-container': XContainer,
                'x-child': XChild,
            }
        });

        class MyMock extends LightningElement {
            connectedCallback() {
                this.template.addEventListener('click', this.handleClickInMock.bind(this));
            }
            render() {
                return htmlMock;
            }
            handleClickInMock(e) {
                expect(e.target).toBe(this.template.querySelector('x-child'));
            }
        }

        const elm = createElement('x-mock', { is: MyMock, fallback: true });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const button = child.shadowRoot.querySelector('button');
        button.click();
    });

    it('should allow traversing up to its parentNode', () => {
        const childHTML = compileTemplate(`<template>
            <slot>
            </slot>
        </template>`);

        let childTemplate;
        class ChildComponent extends LightningElement {
            render() {
                childTemplate = this.template;
                return childHTML;
            }
        }
        const parentHTML = compileTemplate(`<template>
            <c-child>
                <div>Slotted</div>
            </c-child>
        </template>`, {
            modules: {
                'c-child': ChildComponent
            }
        });
        let parentTemplate;
        class ParentComponent extends LightningElement {
            render() {
                parentTemplate = this.template;
                return parentHTML;
            }
        }
        const elm = createElement('x-parent', { is: ParentComponent, fallback: true });
        document.body.appendChild(elm);
        const divFromParent = parentTemplate.querySelector('div');
        const child = parentTemplate.querySelector('c-child');
        const slottedDiv = childTemplate.querySelector('slot').assignedElements()[0];
        expect(slottedDiv).toBe(divFromParent);
        expect(slottedDiv.parentNode).toBe(child);
    });

    it('should not be reachable via query selectors on the slot', () => {
        const childHTML = compileTemplate(`<template>
            <slot>
            </slot>
        </template>`);

        let childTemplate;
        class ChildComponent extends LightningElement {
            render() {
                childTemplate = this.template;
                return childHTML;
            }
        }
        const parentHTML = compileTemplate(`<template>
            <c-child>
                <div>Slotted</div>
            </c-child>
        </template>`, {
            modules: {
                'c-child': ChildComponent
            }
        });

        class ParentComponent extends LightningElement {
            render() {
                return parentHTML;
            }
        }
        const elm = createElement('x-parent', { is: ParentComponent, fallback: true });
        document.body.appendChild(elm);
        const slot = childTemplate.querySelector('slot');
        const slotContent = slot.querySelector('div');
        expect(slotContent).toBe(null);
        const slotElements = slot.querySelectorAll('div');
        expect(slotElements).toHaveLength(0);
    });

    it('should not be reachable via childNodes on the slot', () => {
        const childHTML = compileTemplate(`<template>
            <slot>
            </slot>
        </template>`);

        let childTemplate;
        class ChildComponent extends LightningElement {
            render() {
                childTemplate = this.template;
                return childHTML;
            }
        }
        const parentHTML = compileTemplate(`<template>
            <c-child>
                <div>Slotted</div>
            </c-child>
        </template>`, {
            modules: {
                'c-child': ChildComponent
            }
        });

        class ParentComponent extends LightningElement {
            render() {
                return parentHTML;
            }
        }
        const elm = createElement('x-parent', { is: ParentComponent, fallback: true });
        document.body.appendChild(elm);
        const slot = childTemplate.querySelector('slot');
        let children;
        children = slot.childNodes;
        expect(children).toHaveLength(0);
    });

});
