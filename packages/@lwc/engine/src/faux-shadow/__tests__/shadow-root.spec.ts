/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';

describe('root', () => {
    describe('integration', () => {
        it('should allow searching for elements from template', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const nodes = elm.shadowRoot.querySelectorAll('p');
                expect(nodes).toHaveLength(1);
            });
        });

        it('should allow searching for one element from template', () => {
            const myComponentTmpl = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent extends LightningElement {
                render() {
                    return myComponentTmpl;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            return Promise.resolve().then(() => {
                const node = elm.shadowRoot.querySelector('p');
                expect(node.tagName).toBe('P');
            });
        });

        it('should ignore slotted elements when queried via querySelectorAll', () => {
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
                    <x-child>
                        <p></p>
                    </x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelectorAll('p')).toHaveLength(1);

            const xChild = elm.shadowRoot.querySelector('x-child');
            expect(xChild.shadowRoot.querySelectorAll('p')).toHaveLength(0);
        });

        it('should ignore slotted elements when queried via querySelector', () => {
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
                    <x-child>
                        <p></p>
                    </x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            class Parent extends LightningElement {
                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('p')).not.toBeNull();

            const xChild = elm.shadowRoot.querySelector('x-child');
            expect(xChild.shadowRoot.querySelector('p')).toBeNull();
        });
    });
});
