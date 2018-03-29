import { Element } from "../html-element";
import * as api from "../api";
import { createElement } from '../upgrade';
import { ViewModelReflection } from "../def";

describe('class-list', () => {
    describe('integration', () => {
        it('should support outer className', () => {
            class ChildComponent extends Element {}
            function html($api) {
                return [$api.c('x-child', ChildComponent, { className: 'foo' }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should support outer classMap', () => {
            class ChildComponent extends Element {}
            function html($api) {
                return [$api.c('x-child', ChildComponent, { classMap: { foo: 1 } }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should combine data.className first and then inner classes', () => {
            class ChildComponent extends Element {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }
            function html($api) {
                return [$api.c('x-child', ChildComponent, { className: 'bar  baz' }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('bar baz foo');
        });

        it('should allow deleting outer classes from within', () => {
            class ChildComponent extends Element {
                connectedCallback() {
                    this.classList.remove('foo');
                }
            }
            function html($api) {
                return [$api.c('x-child', ChildComponent, { className: 'foo' }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('');
        });

        it('should dedupe all classes', () => {
            class ChildComponent extends Element {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }
            function html($api) {
                return [$api.c('x-child', ChildComponent, { className: 'foo   foo' }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('foo');
        });

        it('should combine outer classMap and inner classes', () => {
            class ChildComponent extends Element {
                connectedCallback() {
                    this.classList.add('foo');
                }
            }
            function html($api) {
                return [$api.c('x-child', ChildComponent, { classMap: { bar: 1 } }, [])];
            }
            class MyComponent extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const childElm = elm[ViewModelReflection].component.root.querySelector('x-child');
            expect(childElm.className).toBe('bar foo');
        });

        it('should support toggle', () => {
            class MyComponent extends Element {
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
            class MyComponent extends Element {
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
            class MyComponent extends Element {
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

            class MyComponent extends Element {
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
            class MyComponent extends Element {
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

            return Promise.resolve().then(() => {
                expect(elm.className).toBe('foo bar baz');
            });
        });

        it('should support adding new values to classList via connectedCallback', () => {
            const def = class MyComponent extends Element {
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
            return Promise.resolve().then(() => {
                expect(elm.className).toBe('classFromInit classFromConnectedCallback');
            });
        });

        it('should support removing values from classList via connectedCallback', () => {
            const def = class MyComponent extends Element {
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
            return Promise.resolve().then(() => {
                expect(elm.className).toBe('theOnlyClassThatShouldRemain');
            });
        });
    });
});
