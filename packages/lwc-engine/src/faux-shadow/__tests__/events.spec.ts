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
            }).toLogWarning(`[object HTMLUnknownElement] has duplicate listener for event "foo". Instead add the event listener in the connectedCallback() hook.`);
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
            }).toLogWarning(`[object HTMLUnknownElement] has duplicate listener for event "foo". Instead add the event listener in the connectedCallback() hook.`);
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
            }).toLogError(`Did not find event listener for event "foo" executing removeEventListener on [object HTMLUnknownElement]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
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
            }).toLogError(`Did not find event listener for event "foo" executing removeEventListener on [object HTMLUnknownElement]. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
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
});
