import { createElement } from "../main";
import { Element } from "../html-element";
import { ViewModelReflection } from "../def";

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

        it('should invoke connectedCallback() before any child is inserted into the dom', () => {
            let counter = 0;
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class MyComponent1 extends Element {
                connectedCallback() {
                    counter++;
                    expect(this.root.querySelectorAll('p').length).toBe(0);
                }
                render() {
                    return html;
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
            function html($api) {
                return [$api.c('x-child', Child, {})];
            }
            class MyComponent1 extends Element {
                connectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return html;
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
            function html($api) {
                return [$api.c('x-child', Child, {})];
            }
            class MyComponent1 extends Element {
                disconnectedCallback() {
                    stack.push('parent');
                }
                render() {
                    return html;
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
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class MyComponent2 extends Element {
                disconnectedCallback() {
                    counter++;
                    expect(elm.parentNode).toBe(null);
                }
                render() {
                    rcounter++;
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent2 });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(counter).toBe(1);
            expect(rcounter).toBe(1);
            expect(document.body.childNodes.length).toBe(0);
            expect.assertions(4);
        });

        it('should invoke renderedCallback() sync after every change after all child are inserted', () => {
            let counter = 0;
            function html($api) {
                return [$api.h('p', { key: 0 }, [])];
            }
            class MyComponent3 extends Element {
                renderedCallback() {
                    counter++;
                    expect(this.root.querySelectorAll('p').length).toBe(1);
                }
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect.assertions(2);
        });

        it('should invoke parent renderedCallback() sync after every change after all child renderedCallback', () => {
            const cycle = [];
            class Child extends Element {
                renderedCallback() {
                    cycle.push('child');
                }
            }
            function html($api) {
                return [$api.c('x-foo', Child, {})];
            }
            class MyComponent3 extends Element {
                renderedCallback() {
                    cycle.push('parent');
                }
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
            expect(cycle).toEqual(['child', 'parent']);
        });

        it('should invoke renderedCallback() after render after every change after all child are inserted', () => {
            let lifecycle: string[] = [];
            function html($api: any, $cmp: any) {
                return [
                    $api.h('p', {
                        key: 0,
                        attrs: {
                            title: $cmp.foo
                        }
                    }, [])
                ];
            }
            class MyComponent3 extends Element {
                renderedCallback() {
                    lifecycle.push('rendered');
                }
                render() {
                    lifecycle.push('render');
                    return html;
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
            const lifecycle: string[] = [];
            class MyComponent3 extends Element {
                renderedCallback() {
                    lifecycle.push('rendered');
                }
                connectedCallback() {
                    lifecycle.push('connected');
                }
                render() {
                    lifecycle.push('render');
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
            function html($api, $cmp, $slotset, $ctx) {
                return [$api.h(
                    "section", { key: 0 }, [$api.c("x-bar", MyComponent2, {})]
                )];
            }
            class MyComponent1 extends Element {
                render() {
                    return html;
                }
            }

            try {
                const elm = createElement('x-foo', { is: MyComponent1 });
                document.body.appendChild(elm);
            } catch (e) {
                expect(e.wcStack).toBe('<x-foo>\n\t<x-bar>');
            }
        });

        it('should remove listener in disconnectedCallback()', () => {
            expect.assertions(1);
            function fn(event: Event) {
                expect(event.bubbles).toBe(true);
            }
            class MyComponent1 extends Element {
                connectedCallback() {
                    this.addEventListener('click', fn);
                }
                disconnectedCallback() {
                    this.removeEventListener('click', fn);
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            elm.click();
            document.body.removeChild(elm);
            elm.click();
        });
    });
});
