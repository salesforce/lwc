/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../';

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

        const htmlMock = compileTemplate(
            `
            <template>
                <x-container>
                    <x-child></x-child>
                </x-container>
            </template>
        `,
            {
                modules: {
                    'x-container': XContainer,
                    'x-child': XChild,
                },
            }
        );

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

        const elm = createElement('x-mock', { is: MyMock });
        document.body.appendChild(elm);
        const child = elm.shadowRoot.querySelector('x-child');
        const button = child.shadowRoot.querySelector('button');
        button.click();
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
        const parentHTML = compileTemplate(
            `<template>
            <c-child>
                <div>Slotted</div>
            </c-child>
        </template>`,
            {
                modules: {
                    'c-child': ChildComponent,
                },
            }
        );

        class ParentComponent extends LightningElement {
            render() {
                return parentHTML;
            }
        }
        const elm = createElement('x-parent', { is: ParentComponent });
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
        const parentHTML = compileTemplate(
            `<template>
            <c-child>
                <div>Slotted</div>
            </c-child>
        </template>`,
            {
                modules: {
                    'c-child': ChildComponent,
                },
            }
        );

        class ParentComponent extends LightningElement {
            render() {
                return parentHTML;
            }
        }
        const elm = createElement('x-parent', { is: ParentComponent });
        document.body.appendChild(elm);
        const slot = childTemplate.querySelector('slot');
        const children = slot.childNodes;
        expect(children).toHaveLength(0);
    });
});
