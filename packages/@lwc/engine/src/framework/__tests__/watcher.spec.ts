/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('watcher', () => {
    describe('integration', () => {
        it('should not rerender the component if nothing changes', () => {
            let counter = 0;
            class MyComponent1 extends LightningElement {
                render() {
                    counter++;
                    return emptyTemplate;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
        });

        it('should rerender the component if any reactive prop changes', () => {
            let counter = 0;

            const html = compileTemplate(`<template>{x}</template>`);
            class MyComponent2 extends LightningElement {
                render() {
                    counter++;
                    // TODO: if x is used in render (outside of html), and it is not used inside the compiled template
                    // should it still be reactive. We don't know if this must be the case, so
                    // we are deferring this decision from now.
                    // In the case of the slots, since they are only accessible from within the template,
                    // the same rule applies, but without an observable difference.
                    return html;
                }
            }
            MyComponent2.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should not rerender the component if a non-reactive prop changes', () => {
            let counter = 0;
            class MyComponent3 extends LightningElement {
                render() {
                    counter++;
                    return emptyTemplate;
                }
            }
            MyComponent3.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent3 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(1);
            });
        });

        it('should rerender the component if any reactive slot changes', () => {
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
                },
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
            Parent.track = { round: 1 };
            Parent.publicMethods = ['updateRound'];

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            elm.updateRound();

            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should rerender the component if tracked property changes', () => {
            let counter = 0;
            let state;

            const html = compileTemplate(`<template>{state.x}</template>`);
            class MyComponent6 extends LightningElement {
                state = { x: 0 };
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return html;
                }
            }
            MyComponent6.track = { state: 1 };

            const elm = createElement('x-foo', { is: MyComponent6 });
            document.body.appendChild(elm);
            state.x = 2;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should not rerender the component if a non-reactive state changes', () => {
            let counter = 0;
            let state;

            class MyComponent7 extends LightningElement {
                state = { x: 0 };
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return emptyTemplate;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent7 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            state.x = 2;
            return Promise.resolve().then(() => {
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
            MyComponent9.track = { x: 1 };
            MyComponent9.publicMethods = ['updateTracked'];

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

        it('should mark public prop as reactive even if it is used via a getter', () => {
            let counter = 0;

            const html = compileTemplate(`<template>{foo}</template>`);
            class MyComponent2 extends LightningElement {
                get foo() {
                    return this.x;
                }
                render() {
                    counter++;
                    // TODO: if x is used in render (outside of html), and it is not used inside the compiled template
                    // should it still be reactive. We don't know if this must be the case, so
                    // we are deferring this decision from now.
                    // In the case of the slots, since they are only accessible from within the template,
                    // the same rule applies, but without an observable difference.
                    return html;
                }
            }
            MyComponent2.publicProps = { x: 1 };

            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should allow observing public prop via setter', () => {
            let counter = 0;
            let newValue, oldValue;

            class MyComponent2 extends LightningElement {
                set x(value) {
                    counter++;
                    oldValue = newValue;
                    newValue = value;
                }
                get x() {
                    return newValue;
                }
            }
            MyComponent2.publicProps = { x: {} };

            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect(newValue).toBe(2);
            expect(oldValue).toBeUndefined();
        });
    });

    describe('#reactivity()', () => {
        it('should react when a reactive array invokes Array.prototype.push()', () => {
            let counter = 0;

            class MyComponent1 extends LightningElement {
                state = { list: [1, 2] };

                pushToList(value: number) {
                    this.state.list.push(value);
                }

                render() {
                    counter++;
                    this.state.list.map(v => v + 1);
                    return emptyTemplate;
                }
            }
            MyComponent1.track = { state: 1 };
            MyComponent1.publicMethods = ['pushToList'];

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.pushToList(3);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
        it('should react when a reactive array invokes Array.prototype.pop()', () => {
            let counter = 0;

            class MyComponent1 extends LightningElement {
                state = { list: [1, 2] };

                popFromList() {
                    this.state.list.pop();
                }

                render() {
                    counter++;
                    this.state.list.map(v => v + 1);
                    return emptyTemplate;
                }
            }
            MyComponent1.publicMethods = ['popFromList'];
            MyComponent1.track = { state: 1 };

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.popFromList();
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
        it('should react when a reactive array invokes Array.prototype.unshift()', () => {
            let counter = 0;

            class MyComponent1 extends LightningElement {
                state = { list: [1, 2] };
                unshiftFromList(value: number) {
                    this.state.list.unshift(value);
                }
                render() {
                    counter++;
                    this.state.list.map(v => v + 1);
                    return emptyTemplate;
                }
            }
            MyComponent1.publicMethods = ['unshiftFromList'];
            MyComponent1.track = { state: 1 };

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.unshiftFromList(3);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
    });

    describe('#subscribeToSetHook()', () => {
        // TBD
    });

    describe('#notifyListeners()', () => {
        // TBD
    });
});
