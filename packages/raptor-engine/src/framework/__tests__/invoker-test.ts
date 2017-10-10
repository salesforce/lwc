// import * as target from '../invoker';
import * as api from "../api";
import { createElement } from "../main";
import { Element } from "../html-element";

describe('invoker', () => {

    describe('integration', () => {

        beforeEach(() => {
            document.body.innerHTML = '';
        });

        it('should support undefined result from render()', () => {
            let counter = 0;
            class MyComponent extends Element {
                render() {
                    counter++;
                    return;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
        });

        it('should throw if render() returns something that is not a function or a promise or undefined', () => {
            class MyComponent extends Element {
                render() {
                    return 1;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });

        it('should invoke connectedCallback() after all child are inserted into the dom', () => {
            let counter = 0;
            const child = api.h('p', {}, []);
            class MyComponent1 extends Element {
                connectedCallback() {
                    counter++;
                    expect(elm.childNodes[0]).toBe(child.elm);
                }
                render() {
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect.assertions(2);
        });

        it('should invoke connectedCallback() in a child after connectedCallback() on parent', () => {
            const stack = [];
            class Child extends Element {
                connectedCallback() {
                    stack.push('child');
                }
            }
            const child = api.c('x-child', Child, {});
            class MyComponent1 extends Element {
                connectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(stack).toEqual(['parent', 'child']);
        });

        it('should invoke disconnectedCallback() in a child after disconnectedCallback() on parent', () => {
            const stack = [];
            class Child extends Element {
                disconnectedCallback() {
                    stack.push('child');
                }
            }
            const child = api.c('x-child', Child, {});
            class MyComponent1 extends Element {
                disconnectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return () => [child];
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
            const child = api.h('p', {}, []);
            class MyComponent2 extends Element {
                disconnectedCallback() {
                    counter++;
                    expect(elm.parentNode).toBe(null);
                }
                render() {
                    rcounter++;
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(counter).toBe(1);
            expect(rcounter).toBe(1);
            expect(document.body.childNodes.length).toBe(0);
            expect.assertions(4)
        });

        it('should invoke renderedCallback() sync after every change after all child are inserted', () => {
            let counter = 0;
            const child = api.h('p', {}, []);
            class MyComponent3 extends Element {
                renderedCallback() {
                    counter++;
                    expect(elm.childNodes[0]).toBe(child.elm);
                }
                render() {
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
        });

        it('should invoke parent renderedCallback() sync after every change after all child renderedCallback', () => {
            const cycle = [];
            class Child extends Element {
                renderedCallback () {
                    cycle.push('child');
                }
                render () {
                    return () => []
                }
            }

            const child = api.c('x-foo', Child, {});
            class MyComponent3 extends Element {
                renderedCallback() {
                    cycle.push('parent');
                }
                render() {
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(cycle).toEqual(['child', 'parent']);
        });

        it('should invoke renderedCallback() after render after every change after all child are inserted', () => {
            let lifecycle: Array<string> = [];
            class MyComponent3 extends Element {
                renderedCallback() {
                    lifecycle.push('rendered');
                }
                render() {
                    lifecycle.push('render');
                    return ($api: any, $cmp: any) => {
                        return [
                            api.h('p', {
                                attrs: {
                                    title: $cmp.foo
                                }
                            }, [])
                        ]
                    };
                }
            }
            MyComponent3.publicProps = {
                foo: {
                    config: 0
                }
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
            const lifecycle: Array<string> = [];
            const child = api.h('p', {}, []);
            class MyComponent3 extends Element {
                renderedCallback() {
                    lifecycle.push('rendered');
                    expect(elm.childNodes[0]).toBe(child.elm);
                }
                connectedCallback () {
                    lifecycle.push('connected');
                }
                render() {
                    lifecycle.push('render');
                    return () => [child];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(lifecycle).toEqual(['connected', 'render', 'rendered']);
        });

        it('should decorate error thrown with component stack information', () => {
            expect.hasAssertions();
            class MyComponent1 extends Element {
                connectedCallback() {
                    (undefined).foo;
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
            class MyComponent2 extends Element {
                connectedCallback() {
                    (undefined).foo;
                }
            }

            class MyComponent1 extends Element {
                render() {
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [$api.h(
                            "section", {}, [$api.c("x-bar", MyComponent2, {})]
                        )];
                    };
                }
            }

            try {
                const elm = createElement('x-foo', { is: MyComponent1 });
                document.body.appendChild(elm);
            } catch (e) {
                expect(e.wcStack).toBe('<x-foo>\n\t<x-bar>');
            }
        });
    });
});
