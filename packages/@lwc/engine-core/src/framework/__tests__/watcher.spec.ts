/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement, registerDecorators } from '../main';

describe('watcher', () => {
    describe('integration', () => {
        it('should not rerender the component if new elements are slotted', () => {
            let counter = 0;

            const childTmpl = compileTemplate(`
                <template>
                    <slot name="x"></slot>
                </template>
            `);
            class Child extends LightningElement {
                render() {
                    counter++;
                    return childTmpl;
                }
            }

            const parentTmpl = compileTemplate(
                `
                <template>
                    <x-child>
                        <template if:true={round}>
                            <p slot="x"></p>
                        </template>
                    </x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            class Parent extends LightningElement {
                constructor() {
                    super();
                    this.round = 0;
                }
                updateRound() {
                    this.round += 1;
                }
                render() {
                    return parentTmpl;
                }
            }
            registerDecorators(Parent, {
                track: { round: 1 },
                publicMethods: ['updateRound'],
            });

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            elm.updateRound();

            return Promise.resolve().then((_) => {
                // parent slotted into child, not need to rerender child
                expect(counter).toBe(1);
            });
        });

        it('should compute reactive state per rendering', () => {
            let counter = 0;

            const dynamicTmpl = compileTemplate(`<template>{x}</template>`);
            const staticTmpl = compileTemplate(`<template>static</template>`);
            class MyComponent9 extends LightningElement {
                x = 0;

                updateTracked() {
                    this.x++;
                }

                render() {
                    counter++;
                    return counter <= 1 ? dynamicTmpl : staticTmpl;
                }
            }
            registerDecorators(MyComponent9, {
                track: { x: 1 },
                publicMethods: ['updateTracked'],
            });

            const elm = createElement('x-foo', { is: MyComponent9 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);

            // x is marked as reactive since it's tracked and used in the template
            elm.updateTracked();
            return Promise.resolve()
                .then(() => {
                    expect(counter).toBe(2);

                    // x is not longer reactive since it's not consumed in the template.
                    // Updating it's value should not trigger the rerendering anymore.
                    elm.updateTracked();
                })
                .then(() => {
                    expect(counter).toBe(2);
                });
        });
    });
});
