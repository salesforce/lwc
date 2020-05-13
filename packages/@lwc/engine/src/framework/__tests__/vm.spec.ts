/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from '@lwc/engine-dom';
import { compileTemplate } from 'test-utils';
import { LightningElement, registerDecorators } from '../main';
import { getAssociatedVM } from '../vm';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('vm', () => {
    describe('insertion index', () => {
        it('should have idx>0 (creation index) during construction', () => {
            class MyComponent1 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent1 });
            const hiddenFields = getAssociatedVM(elm);
            expect(hiddenFields.idx).toBeGreaterThan(0);
        });

        it('should have idx>0 after insertion', () => {
            class MyComponent2 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            const hiddenFields = getAssociatedVM(elm);
            expect(hiddenFields.idx).toBeGreaterThan(0);
        });

        it('should preserve insertion index after removal of root', () => {
            class MyComponent3 extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            const hiddenFields = getAssociatedVM(elm);
            expect(hiddenFields.idx).toBeGreaterThan(0);
            document.body.removeChild(elm);
            expect(hiddenFields.idx).toBeGreaterThan(0);
        });

        it('should assign bigger idx to children', () => {
            let vm1: VM, vm2: VM;

            class ChildComponent4 extends LightningElement {
                constructor() {
                    super();
                    vm2 = getAssociatedVM(this);
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <x-bar></x-bar>
                </template>
            `,
                {
                    modules: { 'x-bar': ChildComponent4 },
                }
            );
            class MyComponent4 extends LightningElement {
                constructor() {
                    super();
                    vm1 = getAssociatedVM(this);
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent4 });
            document.body.appendChild(elm);
            expect(vm1.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(vm1.idx);
        });

        it('should assign bigger idx on reinsertion, including children idx', () => {
            let vm1: VM, vm2: VM;
            let counter = 0;
            class ChildComponent5 extends LightningElement {
                constructor() {
                    super();
                    vm2 = getAssociatedVM(this);
                }
                render() {
                    counter++;
                    return emptyTemplate;
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <x-bar></x-bar>
                </template>
            `,
                {
                    modules: { 'x-bar': ChildComponent5 },
                }
            );
            class MyComponent5 extends LightningElement {
                constructor() {
                    super();
                    vm1 = getAssociatedVM(this);
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent5 });
            document.body.appendChild(elm);
            expect(vm1.idx).toBeGreaterThan(0);
            expect(vm2.idx).toBeGreaterThan(0);
            const firstIdx = vm1.idx;
            const secondIdx = vm2.idx;
            document.body.removeChild(elm);
            expect(vm1.idx).toBe(firstIdx);
            expect(vm2.idx).toBe(secondIdx);
            // reinsertion
            document.body.appendChild(elm);
            expect(vm1.idx).toBe(firstIdx); // it is reused
            expect(vm2.idx).toBe(secondIdx); // it is reused
            expect(counter).toBe(2);
        });
    });

    describe('slotting for slowpath', () => {
        it('should re-keyed slotted content to avoid reusing elements from default content', () => {
            const childHTML = compileTemplate(`<template>
                <slot>
                    <h1>default slot default content</h1>
                </slot>
                <slot name="foo">
                    <h2>foo slot default content</h2>
                </slot>
            </template>`);
            class ChildComponent extends LightningElement {
                render() {
                    return childHTML;
                }
                renderedCallback() {
                    const h1 = this.template.querySelector('h1');
                    const h2 = this.template.querySelector('h2');
                    if (h1) {
                        h1.setAttribute('def-1', 'internal');
                    }
                    if (h2) {
                        h2.setAttribute('def-2', 'internal');
                    }
                }
            }
            const parentHTML = compileTemplate(
                `<template>
                <c-child>
                    <template if:true={h1}>
                        <h1 slot="">slotted</h1>
                    </template>
                    <template if:true={h2}>
                        <h2 slot="foo"></h2>
                    </template>
                </c-child>
            </template>`,
                {
                    modules: {
                        'c-child': ChildComponent,
                    },
                }
            );
            let parentTemplate;
            class Parent extends LightningElement {
                constructor() {
                    super();
                    this.h1 = false;
                    this.h2 = false;
                    parentTemplate = this.template;
                }
                render() {
                    return parentHTML;
                }
                enable() {
                    this.h1 = this.h2 = true;
                }
                disable() {
                    this.h1 = this.h2 = false;
                }
            }
            registerDecorators(Parent, {
                track: { h1: 1, h2: 1 },
                publicMethods: ['enable', 'disable'],
            });

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            elm.enable();
            return Promise.resolve().then(() => {
                // at this point, if we are reusing the h1 and h2 from the default content
                // of the slots in c-child, they will have an extraneous attribute on them,
                // which will be a problem.
                expect(parentTemplate.querySelector('c-child').outerHTML).toBe(
                    `<c-child><h1 slot="">slotted</h1><h2 slot="foo"></h2></c-child>`
                );
            });
        });
    });
});
