/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement, LightningElement } from '../../framework/main';
import { compileTemplate } from 'test-utils';

describe('events', () => {
    describe('log messages', () => {
        it('should log warning when adding existing listener to the custom element', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.addEventListener('foo', eventListener);
                    this.addEventListener('foo', eventListener);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`[object HTMLElement] has duplicate listener for event "foo". Instead add the event listener in the connectedCallback() hook.`);
        });
        it('should log warning when adding existing listener to the shadowRoot element', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.template.addEventListener('foo', eventListener);
                    this.template.addEventListener('foo', eventListener);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`[object HTMLElement] has duplicate listener for event "foo". Instead add the event listener in the connectedCallback() hook.`);
        });

        it('should log warning when adding existing listener with options to the custom element', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.addEventListener('foo', eventListener, true);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed but received: true`);
        });
        it('should log warning when adding existing listener with options to the ShadowRoot', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.template.addEventListener('foo', eventListener, true);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogWarning(`The 'addEventListener' method in 'ShadowRoot' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed but received: true`);
        });

        it('should log error when removing non attached listener on the custom element', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.removeEventListener('foo', eventListener);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError(`Did not find event listener for event "foo" executing removeEventListener on [object HTMLElement]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
        });

        it('should log error when removing non attached listener on the ShadowRoot', () => {
            function eventListener() {}; // tslint:disable-line
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.template.removeEventListener('foo', eventListener);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toLogError(`Did not find event listener for event "foo" executing removeEventListener on [object HTMLElement]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
        });
    });

    describe('bookkeeping', () => {
        it('removing listener should affect invocation', () => {
            const dispatched = [];
            class MyComponent extends LightningElement {}
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            function a() { dispatched.push('a'); }
            function b() { dispatched.push('b'); }
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
            function a() { dispatched.push('a'); }
            function b() { dispatched.push('b'); }
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
            MyComponent.publicMethods = ['triggerInternalClick'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            function a() { dispatched.push('a'); }
            elm.addEventListener('click', a);
            elm.triggerInternalClick();
            expect(dispatched).toHaveLength(0);
        });
    });
    describe('relatedTarget', () => {
        it('should report correct the retargeted value', () => {
            let relatedTarget;
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
                handleFocus(e) {
                    relatedTarget = e.relatedTarget;
                }
            }
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            const rootHTML = compileTemplate(`
                <template>
                    <x-parent></x-parent>
                    <input onfocus={handleFocus} />
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });
            const parentHTML = compileTemplate(`
                <template>
                    <input />
                </template>
            `);
            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
            elm.shadowRoot.querySelector('x-parent').shadowRoot.querySelector('input').focus();
            // jsdom has some timing issue with focusing
            return Promise.resolve().then(() => {
                elm.shadowRoot.querySelector('input').focus();
                return Promise.resolve().then(() => {
                    expect(relatedTarget).toBe(elm.shadowRoot.querySelector('x-parent'));
                });
            });
        });

        it('should return undefined if the event does not have relatedTarget getter', () => {
            let relatedTarget;
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
                handleFocus(e) {
                    relatedTarget = e.relatedTarget;
                }
            }
            class Parent extends LightningElement {
                render() {
                    return parentHTML;
                }
            }
            const rootHTML = compileTemplate(`
                <template>
                    <x-parent></x-parent>
                    <input onfocus={handleFocus} />
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });
            const parentHTML = compileTemplate(`
                <template>
                    <input />
                </template>
            `);
            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
            elm.shadowRoot.querySelector('x-parent').shadowRoot.querySelector('input').focus();
            // jsdom has some timing issue with focusing
            return Promise.resolve().then(() => {
                const e = new CustomEvent('focus');
                elm.shadowRoot.querySelector('input').dispatchEvent(e);
                return Promise.resolve().then(() => {
                    expect(relatedTarget).toBe(undefined);
                });
            });
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
            class Child extends LightningElement {
                handleClick(evt) {
                    target = evt.target;
                }
                 render() {
                    return childHTML;
                }
            }
            const rootHTML = compileTemplate(`
                <template>
                    <x-parent>
                        <div></div>
                    </x-parent>
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });
            const parentHTML = compileTemplate(`
                <template>
                    <x-child>
                        <slot></slot>
                    </x-child>
                </template>
            `, {
                modules: { 'x-child': Child },
            });
            const childHTML = compileTemplate(`
                <template>
                    <div onclick={handleClick}>
                        <slot></slot>
                    </div>
                </template>
            `, {
                modules: {},
            });
            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('div');
            div.click();
            expect(target).toBe(div);
        });

        it('should report the target as the custom element when the handler is on an element not owned by a custom element', () => {
            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
                handleClick(evt) {
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
            divWithClickHandler.addEventListener('click', function(event) {
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
            document.addEventListener('click', function(event) {
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
            Root.track = {
                newTitle: 1
            };
            Root.publicMethods = ['changeSomething'];
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
            const rootHTML = compileTemplate(`
                <template>
                    <x-parent>
                        <div title={newTitle}></div>
                    </x-parent>
                </template>
            `, {
                modules: { 'x-parent': Parent },
            });
            const parentHTML = compileTemplate(`
                <template>
                    <x-child>
                        <slot></slot>
                    </x-child>
                </template>
            `, {
                modules: { 'x-child': Child },
            });
            const childHTML = compileTemplate(`
                <template>
                    <div onclick={handleClick}>
                        <slot></slot>
                    </div>
                </template>
            `, {
                modules: {},
            });
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
                    this.template.addEventListener('click', event => {
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
                    this.addEventListener("change", (e) => {
                        domEvent = e;
                        expect(e.target).toBe(this.template.host);
                    });
                    const event = document.createEvent("HTMLEvents");
                    event.initEvent("change", false, true);
                    this.dispatchEvent(event);
                    expect(domEvent).toBe(event);
                    expect(domEvent.target).toBe(null); // because the event is not composed
                }
            }

            const childHTML = compileTemplate(`
                <template></template>
            `, {
                modules: {
                    'x-child': Child
                }
            });

            class Root extends LightningElement {
                render() {
                    return rootHTML;
                }
            }

            const rootHTML = compileTemplate(`
                <template>
                    <x-child></x-child>
                </template>
            `, {
                modules: {
                    'x-child': Child
                }
            });

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);
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
                    this.template.addEventListener('click', (evt) => {
                        this.dispatchEvent(new CustomEvent('bubblesnotcomposed', {
                            bubbles:true,
                            composed: false
                        }));
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
                    this.template.addEventListener('bubblesnotcomposed', evt => {
                        listenerCalled = true;
                        target = evt.target;
                    });
                }

                render() {
                    return rootHTML;
                }

            }

            const rootHTML = compileTemplate(`
                <template>
                    <x-child>
                        <x-grand-child>
                            <button>click me.</button>
                        </x-grand-child>
                    </x-child>
                </template>
            `, { modules: { 'x-child': Child, 'x-grand-child': GrandChild } });

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
                handleEvent: function(evt) {
                    expect(this).toBe(eventListener);
                    target = evt.target;
                }
            };

            class MyComponent extends LightningElement {
            }
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
                        handleEvent: function(evt) {
                            expect(this).toBe(eventListener);
                            expect(evt.target).toBe(button);
                        }
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
            MyComponent.publicMethods = ['triggerInternalClick'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.triggerInternalClick();
        });
    });
});
