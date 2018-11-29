import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { getRootNodeGetter } from "../traverse";


describe('dom', () => {
    describe('getRootNode composed true', () => {
        it('should return correct value from child node', () => {
            class MyComponent extends LightningElement {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            const parentTmpl = compileTemplate(`
                <template>
                    <x-child onfoo={handleFoo}></x-child>
                </template>
            `, {
                modules: {
                    'x-child': MyComponent,
                }
            });
            class Parent extends LightningElement {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('x-child');
            const match = getRootNodeGetter.call(child, { composed: true });
            // We can't assert against document directly, because
            // for some reasons, jest is locking up with document here
            expect(match.nodeName).toBe('#document');
        });

        it('should return correct value from self', () => {
            class Parent extends LightningElement {}
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);

            const match = getRootNodeGetter.call(elm, { composed: true });

            expect(match.nodeName).toBe('#document');
        });
    });

    describe('getRootNode composed false', () => {
        it('should return correct value from child node', () => {
            class MyComponent extends LightningElement {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            const parentTmpl = compileTemplate(`
                <template>
                    <x-child onfoo={handleFoo}></x-child>
                </template>
            `, {
                modules: {
                    'x-child': MyComponent,
                }
            });
            class Parent extends LightningElement {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('x-child');
            const match = getRootNodeGetter.call(child, { composed: false });
            // We can't assert against document directly, because
            // for some reasons, jest is locking up with document here
            expect(match).toBe(elm.shadowRoot);
        });

        it('should return correct value from self', () => {
            class Parent extends LightningElement {}
            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);

            const match = getRootNodeGetter.call(elm, { composed: false });

            expect(match.nodeName).toBe('#document');
        });
    });

    describe('composed polyfill', () => {
        it('should get native events as composed true', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('click', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.click();
        });
        // TODO: flapper
        it.skip('should get custom events as composed false', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('bar', function (e) {
                expect(e.composed).toBe(false);
            });
            elm.dispatchEvent(new CustomEvent('bar', {}));
        });

        it('should allow customization of composed init in custom events', function () {
            expect.assertions(1);
            const elm = document.createElement('div');
            document.body.appendChild(elm);
            elm.addEventListener('foo', function (e) {
                expect(e.composed).toBe(true);
            });
            elm.dispatchEvent(new CustomEvent('foo', { composed: true }));
        });

        it('should handle event.target on events dispatched on custom elements', function () {
            expect.assertions(1);
            class MyComponent extends LightningElement {
                trigger() {
                    const event = new CustomEvent('foo', {
                        bubbles: true,
                        composed: true,
                    });

                    this.dispatchEvent(event);
                }
            }
            MyComponent.publicMethods = ['trigger'];

            const parentTmpl = compileTemplate(`
                <template>
                    <x-foo onfoo={handleFoo}></x-foo>
                </template>
            `, {
                modules: {
                    'x-foo': MyComponent,
                }
            });
            class Parent extends LightningElement {
                handleFoo(evt) {
                    expect(evt.target).toBe(this.template.querySelector('x-foo'));
                }

                render() {
                    return parentTmpl;
                }
            }

            const elm = createElement('x-parent', { is: Parent });
            document.body.appendChild(elm);
            const child = elm.shadowRoot.querySelector('x-foo');
            child.trigger();
        });
    });

    describe('cloneNode', () => {
        it('should not include any shadow dom elements', () => {
            const cmpTmpl = compileTemplate(`
                <template>
                    <div></div>
                </template>
            `, {});

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.cloneNode(true);
            expect(clone.childNodes.length).toBe(0);
        });

        it('should include slotted elements', () => {
            const childTmpl = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `, {});

            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }


            const cmpTmpl = compileTemplate(`
                <template>
                    <x-child>
                        <div></div>
                    </x-child>
                </template>
            `, {
                modules: {
                    'x-child': Child
                },
            });

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.shadowRoot.querySelector('x-child').cloneNode(true);
            expect(clone.childNodes.length).toBe(1);
            expect(clone.childNodes[0].tagName).toBe('DIV');
        });

        it('should not include default slotted elements', () => {
            const cmpTmpl = compileTemplate(`
                <template>
                    <slot>
                        <div></div>
                    </slot>
                </template>
            `, {});

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.cloneNode(false);
            expect(clone.childNodes.length).toBe(0);
        });

        it('should not include slotted elements if deep flag is false', () => {
            const childTmpl = compileTemplate(`
                <template>
                    <div>No clone</div>
                    <slot></slot>
                </template>
            `, {});

            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }


            const cmpTmpl = compileTemplate(`
                <template>
                    <x-child data-title="foo">
                        <div></div>
                    </x-child>
                </template>
            `, {
                modules: {
                    'x-child': Child
                },
            });

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.shadowRoot.querySelector('x-child').cloneNode(false);
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<x-child data-title="foo"></x-child>');
        });

        it('should include slotted custom elements correctly', () => {
            const grandChildTmpl = compileTemplate(`
                <template>
                    <div>No clone</div>
                    <slot></slot>
                </template>
            `, {});

            class GrandChild extends LightningElement {
                render() {
                    return grandChildTmpl;
                }
            }

            const childTmpl = compileTemplate(`
                <template>
                    <slot></slot>
                </template>
            `, {});

            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }

            const cmpTmpl = compileTemplate(`
                <template>
                    <x-child>
                        <x-grand>
                            <div></div>
                        </x-grand>
                        <div></div>
                    </x-child>
                </template>
            `, {
                modules: {
                    'x-child': Child,
                    'x-grand': GrandChild
                },
            });

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.shadowRoot.querySelector('x-child').cloneNode(true);
            expect(clone.childNodes.length).toBe(2);
            expect(clone.outerHTML).toBe('<x-child><x-grand><div></div></x-grand><div></div></x-child>');
        });

        it('should not include any shadow dom elements when invoked from native parent element', () => {
            const childTmpl = compileTemplate(`
                <template>
                    <span></span>
                </template>
            `, {});

            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }

            const cmpTmpl = compileTemplate(`
                <template>
                    <div>
                        <x-child></x-child>
                        <span></span>
                    </div>
                </template>
            `, {
                modules: {
                    'x-child': Child,
                }
            });

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.shadowRoot.querySelector('div').cloneNode(true);
            expect(clone.outerHTML).toBe('<div><x-child></x-child><span></span></div>');
        });

        it('should have correct result on native elements when deep is false', () => {
            const childTmpl = compileTemplate(`
                <template>
                    <span></span>
                </template>
            `, {});

            class Child extends LightningElement {
                render() {
                    return childTmpl;
                }
            }

            const cmpTmpl = compileTemplate(`
                <template>
                    <div title="foo">
                        <x-child></x-child>
                        <span></span>
                    </div>
                </template>
            `, {
                modules: {
                    'x-child': Child,
                }
            });

            class Cmp extends LightningElement {
                render() {
                    return cmpTmpl;
                }
            }

            const elm = createElement('x-foo', { is: Cmp });
            document.body.appendChild(elm);
            const clone = elm.shadowRoot.querySelector('div').cloneNode(false);
            expect(clone.outerHTML).toBe('<div title="foo"></div>');
        });
    });
});
