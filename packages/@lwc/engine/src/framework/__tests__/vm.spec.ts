/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from '@lwc/engine-dom';
import { compileTemplate } from 'test-utils';
import { LightningElement, registerDecorators } from '../main';

describe('vm', () => {
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
