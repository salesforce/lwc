import { c, h } from "../../api";
import { patch } from "../../patch";
import { Element } from "../../html-element";
import { createElement } from "./../../upgrade";

describe('module/component-events', () => {
    describe('for vm with internal event logic', () => {
        var elm, vnode0;

        beforeEach(function() {
            elm = document.createElement('x-foo');
            vnode0 = elm;
        });

        it('attaches click event handler to custom element from within (wc-compat)', function() {
            var result = [];
            function clicked(ev) { result.push(ev); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            expect(result).toHaveLength(1);
        });

        it('should dispatch internal listeners first', function() {
            var result = [];
            function clicked1() { result.push(1); }
            function clicked2() { result.push(2); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                }
            }
            var vnode = c('x-foo', Foo, {on: {click: clicked2}});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            expect(result).toEqual([1, 2]);
        });

        it('should preserve behavior of stopimmidiatepropagation() for internal listeners', function() {
            var result = [];
            function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
            function clicked2() { throw new Error('should never reach this listener') }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                    this.addEventListener('click', clicked2);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            expect(result).toEqual([1]);
        });

        it('should preserve behavior of stopimmidiatepropagation() for external listeners', function() {
            var result = [];
            function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
            function clicked2() { throw new Error('should never reach this listener') }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                }
            }
            var vnode = c('x-foo', Foo, {on: {click: clicked2}});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            expect(result).toEqual([1]);
        });

        it('attaches custom event handler to custom element from within (wc-compat)', function() {
            var result = [];
            function tested(ev) { result.push(ev); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('test', tested);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.dispatchEvent(new CustomEvent('test', {}));
            expect(result).toHaveLength(1);
        });

        it('should expose component as context to the event handler when defined from within (wc-compat)', function() {
            var result = [];
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked);
                }
            }
            var vnode1 = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(vnode1.vm.component); // context must be the component
            expect(result[1]).toBeInstanceOf(Event);
        });

        it('should not expose the host element via event.target', function() {
            var event = [];
            function clicked(e) { event = e; }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked);
                }
            }
            var vnode1 = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(event);
            expect(event.target).toBe(vnode1.vm.component);
        });

        it('should add event listeners in constructor when created via createElement', function () {
            let count = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.addEventListener('c-event', function () {
                        count += 1;
                    })
                }
                render() {
                    return function () {
                        return [h('div', {}, [])]
                    }
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const div = elm.querySelector('div') as HTMLElement;
            div.dispatchEvent(new CustomEvent('c-event', {bubbles: true}));
            return Promise.resolve().then(() => {
                expect(count).toBe(1);
            });
        });

        it('should add event listeners in connectedCallback when created via createElement', function () {
            let count = 0;
            class MyComponent extends Element {
                connectedCallback() {
                    this.addEventListener('c-event', function () {
                        count += 1;
                    })
                }
                render() {
                    return function () {
                        return [h('div', {}, [])]
                    }
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const div = elm.querySelector('div') as HTMLElement;
            div.dispatchEvent(new CustomEvent('c-event', {bubbles: true}));
            return Promise.resolve().then(() => {
                expect(count).toBe(1);
            });
        });

        it('should add event listeners in connectedCallback when created via render', function () {
            let count = 0;
            class MyChild extends Element {
                connectedCallback() {
                    this.addEventListener('c-event', function () {
                        count += 1;
                    })
                }
                render() {
                    return function () {
                        return [h('div', {}, [])]
                    }
                }
            }

            class MyComponent extends Element {
                render() {
                    return function () {
                        return [c('x-child', MyChild, {})]
                    }
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const div = elm.querySelector('div') as HTMLElement;
            div.dispatchEvent(new CustomEvent('c-event', {bubbles: true}));
            return Promise.resolve().then(() => {
                expect(count).toBe(1);
            });
        });

        it('should add event listeners in constructor when created via render', function () {
            let count = 0;
            class MyChild extends Element {
                constructor() {
                    super();
                    this.addEventListener('c-event', function () {
                        count += 1;
                    })
                }
                render() {
                    return function () {
                        return [h('div', {}, [])]
                    }
                }
            }

            class MyComponent extends Element {
                render() {
                    return function () {
                        return [c('x-child', MyChild, {})]
                    }
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const div = elm.querySelector('div') as HTMLElement;
            div.dispatchEvent(new CustomEvent('c-event', {bubbles: true}));
            return Promise.resolve().then(() => {
                expect(count).toBe(1);
            });
        });

    });

});
