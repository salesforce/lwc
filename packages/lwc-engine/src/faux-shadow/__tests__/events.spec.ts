import { createElement, LightningElement } from '../../framework/main';
import { compileTemplate } from 'test-utils';
import { getShadowRoot } from '../../faux-shadow/shadow-root';

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
                    target = evt.target
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
            const div = getShadowRoot(elm).querySelector('div');
            div.click();
            expect(target).toBe(div);
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
                newTitle: {
                    config: 3
                }
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
            const div = getShadowRoot(elm).querySelector('div');
            elm.changeSomething();
            return Promise.resolve().then(() => {
                div.click();
                expect(getShadowRoot(elm).querySelector('div')).toBe(div); // making sure that the dom is reused
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
                    <div class="container"></div>
                </template>
            `);

            const elm = createElement('x-root', { is: Root });
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                const anchor = getShadowRoot(elm).querySelector('a');
                anchor.click();
                expect(target).toBe(anchor);
            });
        });
    });
});
