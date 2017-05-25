// import * as target from '../invoker';
import * as api from "../api";
import { patch } from '../patch';
import { Element } from "../html-element";
import assert from 'power-assert';

describe('invoker', () => {

    describe('integration', () => {

        var child;

        beforeEach(function() {
            child = api.h('p', {}, []);
        });

        it('should support undefined result from render()', () => {
            let counter = 0;
            const elm = document.createElement('x-foo');
            class MyComponent extends Element {
                render() {
                    counter++;
                    return;
                }
            }
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode); // insert `x-foo`
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 1);
            });
        });

        it('should throw if render() returns something that is not a function or a promise or undefined', () => {
            const elm = document.createElement('x-foo');
            class MyComponent extends Element {
                render() {
                    return 1;
                }
            }
            const vnode = api.c('x-foo', MyComponent, {});
            assert.throws(() => {
                patch(elm, vnode); // insert `x-foo`
            });
        });

        it('should invoke connectedCallback() after all child are inserted into the dom', () => {
            let counter = 0;
            const elm = document.createElement('x-foo');
            const def = class MyComponent1 extends Element {
                connectedCallback() {
                    counter++;
                    assert.strictEqual(elm.childNodes[0], child.elm, 'the child element is not in the dom yet');
                }
                render() {
                    return () => [child];
                }
            }
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode); // insert `x-foo`
            assert.strictEqual(counter, 0, 'connectedCallback should be invoked async');
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 1);
            });
        });

        it('should invoke disconnectedCallback() after all child are removed from the dom', () => {
            let counter = 0;
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const def = class MyComponent2 extends Element {
                disconnectedCallback() {
                    counter++;
                    assert.strictEqual(elm.childNodes.length, 0, 'the child element is not removed from the dom yet');
                }
                render() {
                    return () => [child];
                }
            }
            const vnode1 = api.c('x-foo', def, {});
            const vnode2 = api.h('div', {}, []);
            patch(elm, vnode1); // insert `x-foo`
            patch(vnode1, vnode2); // replace it with a `div`
            assert.strictEqual(counter, 0, 'disconnectedCallback should be invoked async');
            return Promise.resolve().then(() => {
                assert.strictEqual(document.body.childNodes.length, 1);
                assert.strictEqual(document.body.childNodes[0].tagName, 'DIV');
                assert.strictEqual(counter, 1);
            });
        });

        it('should invoke renderedCallback() async after every change after all child are inserted', () => {
            let counter = 0;
            const elm = document.createElement('x-foo');
            const def = class MyComponent3 extends Element {
                renderedCallback() {
                    counter++;
                    assert.strictEqual(elm.childNodes[0], child.elm, 'the child element is not in the dom yet');
                }
                render() {
                    return () => [child];
                }
            }
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode); // insert `x-foo`
            assert.strictEqual(counter, 0, 'renderedCallback should be invoked async');
            return Promise.resolve().then(() => {
                assert.strictEqual(counter, 1);
            });
        });

    });

});
