/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('invoker', () => {
    describe('integration', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('should throw if render() returns undefined', () => {
            let counter = 0;
            class MyComponent extends LightningElement {
                render() {
                    counter++;
                    return;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
            expect(counter).toBe(1);
        });

        it('should throw if render() returns something that is not a template function', () => {
            class MyComponent extends LightningElement {
                render() {
                    return 1;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });

        it('should invoke connectedCallback() before any child is inserted into the dom', () => {
            let counter = 0;

            const html = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    counter++;
                    expect(this.template.querySelectorAll('p').length).toBe(0);
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect.assertions(2);
        });

        it('should invoke connectedCallback() in a child after connectedCallback() on parent', () => {
            const stack = [];

            class Child extends LightningElement {
                connectedCallback() {
                    stack.push('child');
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <x-child></x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                },
            );
            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(stack).toEqual(['parent', 'child']);
        });

        it('should invoke disconnectedCallback() in a child after disconnectedCallback() on parent', () => {
            const stack = [];

            class Child extends LightningElement {
                disconnectedCallback() {
                    stack.push('child');
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <x-child></x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                },
            );
            class MyComponent1 extends LightningElement {
                disconnectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(stack).toEqual(['parent', 'child']);
        });

        it('should invoke disconnectedCallback() after it was removed from the dom', () => {
            let counter = 0;
            let rcounter = 0;

            const html = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent2 extends LightningElement {
                disconnectedCallback() {
                    counter++;
                    expect(elm.parentNode).toBe(null);
                }
                render() {
                    rcounter++;
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(counter).toBe(1);
            expect(rcounter).toBe(1);
            expect(document.body.childNodes.length).toBe(0);
            expect.assertions(4);
        });

        it('should invoke renderedCallback() sync after every change after all child are inserted', () => {
            let counter = 0;

            const html = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            class MyComponent3 extends LightningElement {
                renderedCallback() {
                    counter++;
                    expect(this.template.querySelectorAll('p').length).toBe(1);
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect.assertions(2);
        });

        it('should invoke parent renderedCallback() sync after every change after all child renderedCallback', () => {
            const cycle = [];

            class Child extends LightningElement {
                renderedCallback() {
                    cycle.push('child');
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <x-child></x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                },
            );
            class MyComponent3 extends LightningElement {
                renderedCallback() {
                    cycle.push('parent');
                }
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(cycle).toEqual(['child', 'parent']);
        });

        it('should invoke renderedCallback() after render after every change after all child are inserted', () => {
            let lifecycle: string[] = [];

            const html = compileTemplate(`
                <template>
                    <p title={foo}></p>
                </template>
            `);
            class MyComponent3 extends LightningElement {
                renderedCallback() {
                    lifecycle.push('rendered');
                }
                render() {
                    lifecycle.push('render');
                    return html;
                }
            }
            MyComponent3.publicProps = {
                foo: {},
            };

            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            lifecycle = [];
            elm.foo = 'bar';

            return Promise.resolve().then(() => {
                expect(lifecycle).toEqual(['render', 'rendered']);
            });
        });

        it('should invoke renderedCallback() sync after connectedCallback and render', () => {
            const lifecycle: string[] = [];

            class MyComponent3 extends LightningElement {
                renderedCallback() {
                    lifecycle.push('rendered');
                }
                connectedCallback() {
                    lifecycle.push('connected');
                }
                render() {
                    lifecycle.push('render');
                    return emptyTemplate;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(lifecycle).toEqual(['connected', 'render', 'rendered']);
        });

        it('should decorate error thrown with component stack information', () => {
            expect.hasAssertions();

            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    undefined.foo;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent1 });
            try {
                document.body.appendChild(elm);
            } catch (e) {
                expect(e.wcStack).toBe('<x-foo>');
            }
        });

        it('should decorate error thrown with component stack information even when nested', () => {
            expect.hasAssertions();

            class MyComponent2 extends LightningElement {
                connectedCallback() {
                    undefined.foo;
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <section>
                        <x-bar></x-bar>
                    </section>
                </template>
            `,
                {
                    modules: { 'x-bar': MyComponent2 },
                },
            );
            class MyComponent1 extends LightningElement {
                render() {
                    return html;
                }
            }

            try {
                const elm = createElement('x-foo', { is: MyComponent1 });
                document.body.appendChild(elm);
            } catch (e) {
                expect(e.wcStack).toBe('<x-foo>\n\t<x-bar>');
            }
        });

        it('can remove listener in disconnectedCallback()', () => {
            let removed;
            function fn() {}

            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    this.template.addEventListener('click', fn);
                }
                disconnectedCallback() {
                    this.template.removeEventListener('click', fn);
                    removed = true;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(removed).toBe(true);
        });
    });
});
