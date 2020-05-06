/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement, registerDecorators } from '../main';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('patch', () => {
    describe('#patch()', () => {
        it('should call connectedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends LightningElement {
                connectedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call disconnectedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends LightningElement {
                disconnectedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call renderedCallback syncronously', () => {
            let flag = false;
            class MyComponent extends LightningElement {
                renderedCallback() {
                    flag = true;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(flag).toBeTruthy();
        });

        it('should call the lifecycle hooks in the right order at insertion', () => {
            const calls = [];

            class Child extends LightningElement {
                constructor() {
                    super();
                    calls.push('child:constructor');
                }
                connectedCallback() {
                    calls.push('child:connectedCallback');
                }
                render() {
                    calls.push('child:render');
                    return emptyTemplate;
                }
                renderedCallback() {
                    calls.push('child:renderedCallback');
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
                }
            );
            class Root extends LightningElement {
                constructor() {
                    super();
                    calls.push('root:constructor');
                }
                connectedCallback() {
                    calls.push('root:connectedCallback');
                }
                render() {
                    calls.push('root:render');
                    return html;
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            expect(calls).toEqual([
                'root:constructor',
                'root:connectedCallback',
                'root:render',
                'child:constructor',
                'child:connectedCallback',
                'child:render',
                'child:renderedCallback',
                'root:renderedCallback',
            ]);
        });

        it('should destroy children in order', () => {
            const calls = [];

            class Child extends LightningElement {
                constructor() {
                    super();
                    calls.push('child:constructor');
                }
                connectedCallback() {
                    calls.push('child:connectedCallback');
                }
                render() {
                    calls.push('child:render');
                    return emptyTemplate;
                }
                renderedCallback() {
                    calls.push('child:renderedCallback');
                }
                disconnectedCallback() {
                    calls.push('child:disconnectedCallback');
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <div></div>
                    <template if:true={state.show}>
                        <x-child></x-child>
                    </template>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            class Root extends LightningElement {
                state = {
                    show: false,
                };
                show() {
                    this.state.show = true;
                }
                hide() {
                    this.state.show = false;
                }
                render() {
                    calls.push('root:render');
                    return html;
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }
            registerDecorators(Root, {
                track: { state: 1 },
                publicMethods: ['show', 'hide'],
            });

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            calls.length = 0;
            elm.show();

            return Promise.resolve().then(() => {
                elm.hide();
                return Promise.resolve().then(() => {
                    expect(calls).toEqual([
                        'root:render',
                        'child:constructor',
                        'child:connectedCallback',
                        'child:render',
                        'child:renderedCallback',
                        'root:renderedCallback',
                        'root:render',
                        'child:disconnectedCallback',
                        'root:renderedCallback',
                    ]);
                });
            });
        });

        it('should call the lifecycle hooks in the right order on update', () => {
            const calls = [];

            class Child extends LightningElement {
                constructor() {
                    super();
                    calls.push('child:constructor');
                }
                connectedCallback() {
                    calls.push('child:connectedCallback');
                }
                render() {
                    calls.push('child:render');
                    return emptyTemplate;
                }
                renderedCallback() {
                    calls.push('child:renderedCallback');
                }
            }

            const html = compileTemplate(
                `
                <template>
                    <template if:true={state.show}>
                        <x-child></x-child>
                    </template>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            class Root extends LightningElement {
                state = {
                    show: false,
                };
                show() {
                    this.state.show = true;
                }
                render() {
                    calls.push('root:render');
                    return html;
                }
                renderedCallback() {
                    calls.push('root:renderedCallback');
                }
            }
            registerDecorators(Root, {
                track: { state: 1 },
                publicMethods: ['show'],
            });

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            calls.length = 0;
            elm.show();

            return Promise.resolve().then(() => {
                expect(calls).toEqual([
                    'root:render',
                    'child:constructor',
                    'child:connectedCallback',
                    'child:render',
                    'child:renderedCallback',
                    'root:renderedCallback',
                ]);
            });
        });

        it('should rehydrate when state is updated in renderedCallback', function () {
            const html = compileTemplate(`
                <template>
                    <span>{state.foo}</span>
                </template>
            `);
            class MyComponent extends LightningElement {
                state = {
                    foo: 'bar',
                };
                renderedCallback() {
                    if (this.state.foo !== 'second') {
                        this.state.foo = 'modified';
                    }
                }

                triggerRender(text) {
                    this.state.foo = text;
                }

                render() {
                    return html;
                }
            }
            registerDecorators(MyComponent, {
                track: { state: 1 },
                publicMethods: ['triggerRender'],
            });

            const element = createElement('x-parent', { is: MyComponent });
            document.body.appendChild(element);

            return Promise.resolve()
                .then(() => {
                    element.triggerRender('first');
                })
                .then(() => {
                    element.triggerRender('second');
                })
                .then(() => {
                    expect(element.shadowRoot.querySelector('span').textContent).toBe('second');
                });
        });

        it('should preserve the creation order and the hook order', () => {
            let chars = '^';

            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    chars += 'connected-1:';
                }
                renderedCallback() {
                    chars += 'rendered-1:';
                }
            }

            class MyComponent2 extends LightningElement {
                connectedCallback() {
                    chars += 'connected-2:';
                }
                renderedCallback() {
                    chars += 'rendered-2:';
                }
            }

            const elm1 = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm1);
            const elm2 = createElement('x-bar', { is: MyComponent2 });
            document.body.appendChild(elm2);
            expect(chars).toBe('^connected-1:rendered-1:connected-2:rendered-2:');
        });

        it('should disconnect when mounting a different element', () => {
            let chars = '^';

            class MyComponent1 extends LightningElement {
                connectedCallback() {
                    chars += 'connected:';
                }
                disconnectedCallback() {
                    chars += 'disconnected:';
                }
                renderedCallback() {
                    chars += 'rendered:';
                }
            }

            const elm1 = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm1);
            document.body.removeChild(elm1);
            expect(chars).toBe('^connected:rendered:disconnected:');
        });
    });
});
