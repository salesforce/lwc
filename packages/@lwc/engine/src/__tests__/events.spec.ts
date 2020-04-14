/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement, registerDecorators } from '../';
import { compileTemplate } from 'test-utils';

describe('events', () => {
    describe('bookkeeping', () => {
        it('removing listener should affect invocation', () => {
            const dispatched = [];
            class MyComponent extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            function a() {
                dispatched.push('a');
            }
            function b() {
                dispatched.push('b');
            }
            elm.addEventListener('click', a);
            elm.addEventListener('click', () => {
                elm.removeEventListener('click', b);
            });
            elm.addEventListener('click', b);
            elm.click();
            expect(dispatched).toEqual(['a']);
        });

        it('adding listener should not affect invocation', () => {
            const dispatched = [];
            class MyComponent extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            function a() {
                dispatched.push('a');
            }
            function b() {
                dispatched.push('b');
            }
            elm.addEventListener('click', a);
            elm.addEventListener('click', () => {
                elm.addEventListener('click', b);
            });
            elm.click();
            expect(dispatched).toEqual(['a']);
        });

        it('invoking event.stopPropagation() in a listener on the template should prevent listeners on the host from being invoked', () => {
            const dispatched = [];
            const tpl = compileTemplate(`
                <template>
                    <button>click me</button>
                </template>
            `);

            class MyComponent extends LightningElement {
                renderedCallback() {
                    this.template.addEventListener('click', (event) => {
                        event.stopPropagation();
                    });
                }

                triggerInternalClick() {
                    this.template.querySelector('button').click();
                }

                render() {
                    return tpl;
                }
            }
            registerDecorators(MyComponent, {
                publicMethods: ['triggerInternalClick'],
            });
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            function a() {
                dispatched.push('a');
            }
            elm.addEventListener('click', a);
            elm.triggerInternalClick();
            expect(dispatched).toHaveLength(0);
        });
    });

    describe('retargeting', () => {
        it('should report correct target when slotted through multiple components', () => {
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
            }
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            let target;
            let srcElement;
            class Child extends LightningElement {
                handleClick(evt) {
                    target = evt.target;
                    srcElement = evt.srcElement;
                }
                render() {
                    return childHTML;
                }
            }
            const rootHTML = compileTemplate(
                `
                <template>
                    <x-parent>
                        <div></div>
                    </x-parent>
                </template>
            `,
                {
                    modules: { 'x-parent': Parent },
                }
            );
            const parentHTML = compileTemplate(
                `
                <template>
                    <x-child>
                        <slot></slot>
                    </x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            const childHTML = compileTemplate(
                `
                <template>
                    <div onclick={handleClick}>
                        <slot></slot>
                    </div>
                </template>
            `,
                {
                    modules: {},
                }
            );
            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('div');
            div.click();
            expect(target).toBe(div);
            expect(srcElement).toBe(div);
        });

        it('should report the target as the custom element when the handler is on an element not owned by a custom element', () => {
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
                handleClick() {
                    // event handler is here to trigger patching of the event
                }
            }
            const rootHTML = compileTemplate(`
                <template>
                    <div onclick={handleClick}></div>
                </template>
            `);

            // The below sets up the following HTML:
            // <body>
            //   <div> <!-- with onclick handler that accesses event.target -->
            //     <x-root data-target="x-root">
            //       <div onclick={handleClick}></div>
            //     </x-root>
            //   </div>
            // </body>
            const elm = createElement('x-root', { is: Root });
            elm.setAttribute('data-target', 'x-root');
            const divWithClickHandler = document.createElement('div');
            let target;
            divWithClickHandler.addEventListener('click', function (event) {
                target = event.target;
            });
            divWithClickHandler.appendChild(elm);
            document.body.appendChild(divWithClickHandler);

            const div = elm.shadowRoot.querySelector('div');
            div.click();

            expect(target.getAttribute('data-target')).toBe('x-root');
        });

        it('should report the target as the custom element when the handler is on "document"', () => {
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
            }
            const rootHTML = compileTemplate(`
                <template>
                    <div></div>
                </template>
            `);

            let target;
            document.addEventListener('click', function (event) {
                target = event.target;
            });
            const elm = createElement('x-root', { is: Root });
            elm.setAttribute('data-target', 'x-root');
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelector('div');
            div.click();

            expect(target.getAttribute('data-target')).toBe('x-root');
        });

        it('should report correct target when slotted through multiple components and rehydration happens', () => {
            class Root extends LightningElement {
                newTitle = 'bar';
                changeSomething() {
                    this.newTitle = 'foo';
                }
                render() {
                    return rootHTML;
                }
            }
            registerDecorators(Root, {
                track: { newTitle: 1 },
                publicMethods: ['changeSomething'],
            });
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            let target;
            class Child extends LightningElement {
                handleClick(evt) {
                    target = evt.target;
                }
                render() {
                    return childHTML;
                }
            }
            const rootHTML = compileTemplate(
                `
                <template>
                    <x-parent>
                        <div title={newTitle}></div>
                    </x-parent>
                </template>
            `,
                {
                    modules: { 'x-parent': Parent },
                }
            );
            const parentHTML = compileTemplate(
                `
                <template>
                    <x-child>
                        <slot></slot>
                    </x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            const childHTML = compileTemplate(
                `
                <template>
                    <div onclick={handleClick}>
                        <slot></slot>
                    </div>
                </template>
            `,
                {
                    modules: {},
                }
            );
            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('div');
            elm.changeSomething();
            return Promise.resolve().then(() => {
                div.click();
                expect(elm.shadowRoot.querySelector('div')).toBe(div); // making sure that the dom is reused
                expect(target).toBe(div);
            });
        });

        it('should report correct target when elements are added via innerHTML', () => {
            let target;

            class Root extends LightningElement {
                renderedCallback() {
                    this.template.addEventListener('click', (event) => {
                        target = event.target;
                    });
                    this.template.querySelector('.container').innerHTML = `<span><a></a></span>`;
                }
                render() {
                    return rootHTML;
                }
            }

            const rootHTML = compileTemplate(`
                <template>
                    <div class="container" lwc:dom="manual"></div>
                </template>
            `);

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const anchor = elm.shadowRoot.querySelector('a');
                anchor.click();
                expect(target).toBe(anchor);
            });
        });

        it('should retarget events created manually', () => {
            expect.assertions(3);
            class Child extends LightningElement {
                render() {
                    return childHTML;
                }
                renderedCallback() {
                    let domEvent;
                    this.addEventListener('change', (e) => {
                        domEvent = e;
                        expect(e.target).toBe(this.template.host);
                    });
                    const event = document.createEvent('HTMLEvents');
                    event.initEvent('change', false, true);
                    this.dispatchEvent(event);
                    expect(domEvent).toBe(event);
                    expect(domEvent.target).toBe(null); // because the event is not composed
                }
            }

            const childHTML = compileTemplate(
                `
                <template></template>
            `,
                {
                    modules: {
                        'x-child': Child,
                    },
                }
            );

            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
            }

            const rootHTML = compileTemplate(
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

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
        });
    });

    describe('composed path', () => {
        it('should report correct composedPath for event.composed=true', () => {
            expect.assertions(2);
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            let event;
            class Child extends LightningElement {
                handleClick(evt) {
                    event = evt;
                    // div, child's shadow, x-child, parent's shadow, x-parent, body, html, document, window
                    expect(evt.composedPath().length).toBe(9);
                }
                render() {
                    return childHTML;
                }
            }
            const parentHTML = compileTemplate(
                `
                <template>
                    <x-child></x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            const childHTML = compileTemplate(
                `
                <template>
                    <div onclick={handleClick}>
                    </div>
                </template>
            `,
                {
                    modules: {},
                }
            );
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');
            div.click();
            // checking the value after the dispatch mechanism has finished
            const composedPath = event.composedPath();
            // empty list
            expect(composedPath.length).toBe(0);
        });
        it('should report correct composedPath for event.composed=false', () => {
            expect.assertions(2);
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            let event;
            class Child extends LightningElement {
                handleFoo(evt) {
                    event = evt;
                    // div, child's shadow
                    expect(evt.composedPath().length).toBe(2);
                }
                render() {
                    return childHTML;
                }
            }
            const parentHTML = compileTemplate(
                `
                <template>
                    <x-child></x-child>
                </template>
            `,
                {
                    modules: { 'x-child': Child },
                }
            );
            const childHTML = compileTemplate(
                `
                <template>
                    <div onfoo={handleFoo}>
                    </div>
                </template>
            `,
                {
                    modules: {},
                }
            );
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');
            div.dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: false }));
            // checking the value after the dispatch mechanism has finished
            const composedPath = event.composedPath();
            // empty list
            expect(composedPath.length).toBe(0);
        });
    });

    describe('template listener', () => {
        it('should get called when event bubbles=true, composed=false and come from within a slot.', () => {
            const childHTML = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `);
            class Child extends LightningElement {
                render() {
                    return childHTML;
                }
            }

            const grandChildHTML = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `);
            class GrandChild extends LightningElement {
                connectedCallback() {
                    this.template.addEventListener('click', () => {
                        this.dispatchEvent(
                            new CustomEvent('bubblesnotcomposed', {
                                bubbles: true,
                                composed: false,
                            })
                        );
                    });
                }
                render() {
                    return grandChildHTML;
                }
            }

            let listenerCalled = false;
            let target;
            class Root extends LightningElement {
                connectedCallback() {
                    this.template.addEventListener('bubblesnotcomposed', (evt) => {
                        listenerCalled = true;
                        target = evt.target;
                    });
                }

                render() {
                    return rootHTML;
                }
            }

            const rootHTML = compileTemplate(
                `
                <template>
                    <x-child>
                        <x-grand-child>
                            <button>click me.</button>
                        </x-grand-child>
                    </x-child>
                </template>
            `,
                { modules: { 'x-child': Child, 'x-grand-child': GrandChild } }
            );

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const button = elm.shadowRoot.querySelector('button');
                const expectedTarget = elm.shadowRoot.querySelector('x-grand-child');
                button.click();

                expect(listenerCalled).toBe(true);
                expect(target).toBe(expectedTarget);
            });
        });
    });
    describe('event patching preserves standard listener specs', () => {
        it('Issue#941: an object type EventListener works on standard html nodes outside custom element', () => {
            let target;
            const eventListener = {
                handleEvent: function (evt) {
                    expect(this).toBe(eventListener);
                    target = evt.target;
                },
            };

            class MyComponent extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent });
            const span = document.createElement('span');
            span.appendChild(elm);
            span.addEventListener('click', eventListener);
            document.body.appendChild(span);
            elm.click();
            expect(target).toBe(elm);
        });
        it('Issue#941: an object type EventListener works on standard html nodes in the template', () => {
            expect.assertions(2);
            const tpl = compileTemplate(`
                <template>
                    <button>click me</button>
                </template>
            `);

            class MyComponent extends LightningElement {
                renderedCallback() {
                    const button = this.template.querySelector('button');
                    const eventListener = {
                        handleEvent: function (evt) {
                            expect(this).toBe(eventListener);
                            expect(evt.target).toBe(button);
                        },
                    };
                    button.addEventListener('click', eventListener);
                }

                triggerInternalClick() {
                    this.template.querySelector('button').click();
                }

                render() {
                    return tpl;
                }
            }
            registerDecorators(MyComponent, {
                publicMethods: ['triggerInternalClick'],
            });
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.triggerInternalClick();
        });
    });
});
