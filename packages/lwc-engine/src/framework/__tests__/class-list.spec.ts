import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../main';

const emptyTemplate = compileTemplate(`<template></template>`);

describe('class-list', () => {
    describe('integration', () => {
        it('should support static class attribute', () => {
            class ChildComponent extends LightningElement {}

            const html = compileTemplate(
                `<template>
                    <x-child class="foo"></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should support outer classMap', () => {
            class ChildComponent extends LightningElement {}

            const html = compileTemplate(
                `<template>
                    <x-child class={dynamicClass}></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                dynamicClass = 'foo';

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should combine static class first and then inner classes', () => {
            class ChildComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }

            const html = compileTemplate(
                `<template>
                    <x-child class="bar baz"></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('bar baz foo');
        });

        it('should allow deleting outer classes from within', () => {
            class ChildComponent extends LightningElement {
                connectedCallback() {
                    this.classList.remove('foo');
                }
            }

            const html = compileTemplate(
                `<template>
                    <x-child class="foo"></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('');
        });

        it('should dedupe all classes', () => {
            class ChildComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }

            const html = compileTemplate(
                `<template>
                    <x-child class="foo foo"></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should combine dynamic class first and inner classes', () => {
            class ChildComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }

            const html = compileTemplate(
                `<template>
                    <x-child class={dynamicClass}></x-child>
                </template>`,
                {
                    modules: { 'x-child': ChildComponent }
                }
            );
            class MyComponent extends LightningElement {
                dynamicClass = 'bar';

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm.shadowRoot.querySelector('x-child');
            expect(childElm.className).toBe('bar foo');
        });

        it('should support toggle', () => {
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');
                    this.classList.toggle('foo');
                    this.classList.toggle('bar');
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.className).toBe('bar');
        });

        it('should support toggle with force', () => {
            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.classList.toggle('foo', true);
                    this.classList.toggle('bar', false);
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.className).toBe('foo');
        });

        it('should support contains', () => {
            expect.assertions(2);

            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');

                    expect(this.classList.contains('foo')).toBe(true);
                    expect(this.classList.contains('bar')).toBe(false);
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should support item', () => {
            expect.assertions(2);

            class MyComponent extends LightningElement {
                connectedCallback() {
                    this.classList.add('foo');

                    expect(this.classList.item(0)).toBe('foo');
                    expect(this.classList.item(1)).toBeNull();
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should update on the next tick when dirty', () => {
            class MyComponent extends LightningElement {
                state = { x: 1 };
                initClassNames() {
                    this.classList.add('foo');
                }
                addAnotherClass() {
                    this.classList.add('bar');
                }
                addOtherClass() {
                    this.classList.add('baz');
                }
                updateTracked(value) {
                    this.state.x = value;
                }
                render() {
                    this.state.x;
                    return emptyTemplate;
                }
            }
            MyComponent.publicMethods = ['initClassNames', 'updateTracked', 'addAnotherClass', 'addOtherClass'];
            MyComponent.track = { state: 1 };
            MyComponent.publicProps = { x: true };

            const elm = createElement('x-foo', { is: MyComponent });
            elm.initClassNames();
            document.body.appendChild(elm);
            expect(elm.className).toBe('foo');
            elm.addAnotherClass();
            elm.updateTracked(2); // dirty trigger
            elm.addOtherClass();

            expect(elm.className).toBe('foo bar baz');
        });

        it('should support adding new values to classList via connectedCallback', () => {
            const def = class MyComponent extends LightningElement {
                initClassNames() {
                    this.classList.add('classFromInit');
                }

                connectedCallback() {
                    this.classList.add('classFromConnectedCallback');
                }
            };
            def.publicMethods = ['initClassNames'];

            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            document.body.appendChild(elm);

            expect(elm.className).toBe('classFromInit classFromConnectedCallback');
        });

        it('should support removing values from classList via connectedCallback', () => {
            const def = class MyComponent extends LightningElement {
                initClassNames() {
                    this.classList.add('theOnlyClassThatShouldRemain');
                    this.classList.add('classToRemoveDuringConnectedCb');
                }

                connectedCallback() {
                    this.classList.remove('classToRemoveDuringConnectedCb');
                }
            };
            def.publicMethods = ['initClassNames'];

            const elm = createElement('x-foo', { is: def });
            elm.initClassNames();
            document.body.appendChild(elm);

            expect(elm.className).toBe('theOnlyClassThatShouldRemain');
        });
    });
});
