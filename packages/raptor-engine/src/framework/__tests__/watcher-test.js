// import * as target from '../watcher.js';
import * as api from "../api.js";
import { patch } from '../patch.js';
import { Element } from "../html-element.js";
import assert from 'power-assert';

describe('watcher.js', () => {

    describe('integration', () => {

        it('should not rerender the component if nothing changes', () => {
            let counter = 0;
            const def = class MyComponent1 extends Element {
                render() {
                    counter++;
                }
            }
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, {});
            const vnode2 = api.c('x-foo', def, {});
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 1);
        });

        it('should rerender the component if any reactive prop changes', () => {
            let counter = 0;
            const def = class MyComponent2 extends Element {
                render() {
                    counter++;
                    // TODO: if x is used in render (outside of html), and it is not used inside the compiled template
                    // should it still be reactive. We don't know if this must be the case, so
                    // we are deferring this decision from now.
                    // In the case of the slots, since they are only accessible from within the template,
                    // the same rule applies, but without an observable difference.
                    return function html($api, $cmp) {
                        $cmp.x;
                    };
                }
            }
            def.publicProps = { x: 1 };
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, { props: { x: 2 } });
            const vnode2 = api.c('x-foo', def, { props: { x: 3 } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 2);
        });

        it('should not rerender the component if a non-reactive prop changes', () => {
            let counter = 0;
            const def = class MyComponent3 extends Element {
                render() {
                    counter++;
                }
            }
            def.publicProps = { x: 1 };
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, { props: { x: 2 } });
            const vnode2 = api.c('x-foo', def, { props: { x: 3 } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 1);
        });

        it('should rerender the component if any reactive slot changes', () => {
            let counter = 0;
            const def = class MyComponent4 extends Element {
                render() {
                    counter++;
                    return function html($api, $cmp, $slotset) {
                        $slotset.x;
                    };
                }
            }
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, {});
            const vnode2 = api.c('x-foo', def, { slotset: { x: [api.h('p', {}, [])] } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 2);
        });

        it('should not rerender the component if a non-reactive slot changes', () => {
            let counter = 0;
            const def = class MyComponent5 extends Element {
                render() {
                    counter++;
                }
            }
            def.publicProps = { x: 1 };
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, { slotset: { x: [] } });
            const vnode2 = api.c('x-foo', def, { slotset: { x: [/* new array */] } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 1);
        });

        it('should rerender the component if reactive state changes', () => {
            let counter = 0;
            let state;
            const def = class MyComponent6 extends Element {
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return function html($api, $cmp) {
                        $cmp.state.x;
                    };
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual(counter, 1);
            state.x = 1;
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 2);
            });
        });

        it('should not rerender the component if a non-reactive state changes', () => {
            let counter = 0;
            let state;
            const def = class MyComponent7 extends Element {
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual(counter, 1);
            state.x = 1; // this is not used in the rendering phase
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 1);
            });
        });

        it('should prevent any mutation during the rendering phase', () => {
            const def = class MyComponent8 extends Element {
                render() {
                    return function html($api, $cmp) {
                        $cmp.state.y = 2;
                    };
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            assert.throws(() => patch(elm, vnode));
        });

        it('should compute reactive state per rendering', () => {
            let counter = 0;
            let state;
            const def = class MyComponent9 extends Element {
                constructor() {
                    super();
                    state = this.state;
                }
                render() {
                    counter++;
                    return function html($api, $cmp) {
                        if (counter === 1) {
                            $cmp.state.x;
                        }
                    };
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            assert.strictEqual(counter, 1);
            state.x = 1; // this is marked as reactive
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 2);
                state.x = 2; // this is not longer reactive and should not trigger the rerendering anymore
                return Promise.resolve().then(() => {
                    assert.strictEqual(counter, 2);
                });
            });
        });

        it('should mark public prop as reactive even if it is used via a getter', () => {
            let counter = 0;
            const def = class MyComponent2 extends Element {
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
                    return function html($api, $cmp) {
                        $cmp.foo;
                    };
                }
            }
            def.publicProps = { x: 1 };
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, { props: { x: 2 } });
            const vnode2 = api.c('x-foo', def, { props: { x: 3 } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 2);
        });

        it('should mark public prop as reactive even if it is used via a getter', () => {
            let counter = 0;
            let newValue, oldValue;
            const def = class MyComponent2 extends Element {
                attributeChangedCallback(attrName, ov, nv) {
                    counter++;
                    newValue = nv;
                    oldValue = ov;
                }
            }
            def.publicProps = { x: 1 };
            def.observedAttributes = ['x'];
            const elm = document.createElement('x-foo');
            const vnode1 = api.c('x-foo', def, { props: { x: 2 } });
            const vnode2 = api.c('x-foo', def, { props: { x: 2 } });
            patch(elm, vnode1);
            patch(vnode1, vnode2);
            assert.strictEqual(counter, 1);
            assert.strictEqual(newValue, 2);
            assert.strictEqual(oldValue, undefined);
        });

    });

    describe('#subscribeToSetHook()', () => {
        // TBD
    });

    describe('#notifyListeners()', () => {
        // TBD
    });

});
