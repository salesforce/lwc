import { createElement, Element } from '../main';

describe('watcher', () => {

    describe('integration', () => {

        it('should not rerender the component if nothing changes', () => {
            let counter = 0;
            class MyComponent1 extends Element {
                render() {
                    counter++;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
        });

        it('should rerender the component if any reactive prop changes', () => {
            let counter = 0;
            function html($api, $cmp) {
                $cmp.x;
                return [];
            }
            class MyComponent2 extends Element {
                render() {
                    counter++;
                    // TODO: if x is used in render (outside of html), and it is not used inside the compiled template
                    // should it still be reactive. We don't know if this must be the case, so
                    // we are deferring this decision from now.
                    // In the case of the slots, since they are only accessible from within the template,
                    // the same rule applies, but without an observable difference.
                    return html;
                }
            }
            MyComponent2.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should not rerender the component if a non-reactive prop changes', () => {
            let counter = 0;
            class MyComponent3 extends Element {
                render() {
                    counter++;
                }
            }
            MyComponent3.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent3 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(1);
            });
        });

        it('should rerender the component if any reactive slot changes', () => {
            let counter = 0;
            function html1($api, $cmp, $slotset, $ctx) {
                return [$api.s('x', {
                    key: 0,
                    attrs: {
                        name: 'x'
                    }
                }, [], $slotset)];
            }
            html1.slots = ["x"];
            class Child extends Element {
                render() {
                    counter++;
                    return html1;
                }
            }
            function html2($api, $cmp) {
                const r = $cmp.round;
                return [$api.c('x-child', Child, {}, r === 0 ? [] : [$api.h('p', { key: 0, attrs: { slot: 'x' } }, [])])];
            }
            class MyComponent4 extends Element {
                constructor() {
                    super();
                    this.round = 0;
                }
                updateRound() {
                    this.round += 1;
                }
                render() {
                    return html2;
                }
            }
            MyComponent4.track = { round: 1 };
            MyComponent4.publicMethods = ['updateRound'];

            const elm = createElement('x-foo', { is: MyComponent4 });
            document.body.appendChild(elm);
            elm.updateRound();

            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should rerender the component if tracked property changes', () => {
            let counter = 0;
            let state;
            function html($api, $cmp) {
                $cmp.state.x;
                return [];
            }
            class MyComponent6 extends Element {
                state = { x: 0 };
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return html;
                }
            }
            MyComponent6.track = { state: 1 };
            const elm = createElement('x-foo', { is: MyComponent6 });
            document.body.appendChild(elm);
            state.x = 2;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should not rerender the component if a non-reactive state changes', () => {
            let counter = 0;
            let state;
            class MyComponent7 extends Element {
                state = { x: 0 };
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent7 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            state.x = 2;
            return Promise.resolve().then(() => {
                expect(counter).toBe(1);
            });
        });

        it('should prevent any mutation during the rendering phase', () => {
            function html($api, $cmp) {
                $cmp.state.x = 1;
            }
            class MyComponent8 extends Element {
                state = { x: 0 };
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent8 });
            expect(() => document.body.appendChild(elm)).toThrow();
        });

        it('should compute reactive state per rendering', () => {
            let counter = 0;
            let state;
            function html($api, $cmp) {
                if (counter === 1) {
                    $cmp.state.x;
                }
                return [];
            }
            class MyComponent9 extends Element {
                state = { x: 0 };
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return html;
                }
            }
            MyComponent9.track = { state: 1 };
            const elm = createElement('x-foo', { is: MyComponent9 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            state.x = 1; // this is marked as reactive
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
                state.x = 2; // this is not longer reactive and should not trigger the rerendering anymore
                return Promise.resolve().then(() => {
                    expect(counter).toBe(2);
                });
            });
        });

        it('should mark public prop as reactive even if it is used via a getter', () => {
            let counter = 0;
            function html($api, $cmp) {
                $cmp.foo;
                return [];
            }
            class MyComponent2 extends Element {
                get foo() {
                    return this.x;
                }
                render() {
                    counter++;
                    // TODO: if x is used in render (outside of html), and it is not used inside the compiled template
                    // should it still be reactive. We don't know if this must be the case, so
                    // we are deferring this decision from now.
                    // In the case of the slots, since they are only accessible from within the template,
                    // the same rule applies, but without an observable difference.
                    return html;
                }
            }
            MyComponent2.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            elm.x = 3;
            Promise.resolve().then(_ => {
                expect(counter).toBe(2);
            });
        });

        it('should allow observing public prop via setter', () => {
            let counter = 0;
            let newValue, oldValue;
            class MyComponent2 extends Element {
                set x(value) {
                    counter++;
                    oldValue = newValue;
                    newValue = value;
                }
                get x() {
                    return newValue;
                }
            }
            MyComponent2.publicProps = { x: { config: 3 } };
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 2;
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            expect(newValue).toBe(2);
            expect(oldValue).toBeUndefined();
        });

    });

    describe('#reactivity()', () => {
        it('should react when a reactive array invokes Array.prototype.push()', () => {
            let counter = 0;
            class MyComponent1 extends Element {
                state = { list: [1, 2] };

                pushToList(value: number) {
                    this.state.list.push(value);
                }

                render() {
                    counter++;
                    this.state.list.map((v) => v + 1);
                }
            }
            MyComponent1.track = { state: 1 };
            MyComponent1.publicMethods = ['pushToList'];
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.pushToList(3);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
        it('should react when a reactive array invokes Array.prototype.pop()', () => {
            let counter = 0;
            class MyComponent1 extends Element {
                state = { list: [1, 2] };

                popFromList() {
                    this.state.list.pop();
                }

                render() {
                    counter++;
                    this.state.list.map((v) => v + 1);
                }
            }
            MyComponent1.publicMethods = ['popFromList'];
            MyComponent1.track = { state: 1 };
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.popFromList();
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
        it('should react when a reactive array invokes Array.prototype.unshift()', () => {
            let counter = 0;
            class MyComponent1 extends Element {
                state = { list: [1, 2] };
                unshiftFromList(value: number) {
                    this.state.list.unshift(value);
                }
                render() {
                    counter++;
                    this.state.list.map((v) => v + 1);
                }
            }
            MyComponent1.publicMethods = ['unshiftFromList'];
            MyComponent1.track = { state: 1 };
            const elm = createElement('x-foo', { is: MyComponent1 });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.unshiftFromList(3);
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });
    });

    describe('#subscribeToSetHook()', () => {
        // TBD
    });

    describe('#notifyListeners()', () => {
        // TBD
    });

});
