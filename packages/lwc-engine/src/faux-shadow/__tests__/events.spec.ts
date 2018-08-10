import { createElement, LightningElement } from '../../framework/main';
import { compileTemplate } from 'test-utils';

describe('events', () => {
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
