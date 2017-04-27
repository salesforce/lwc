// import * as target from '../watcher.js';
import * as api from "../api.js";
import { patch } from '../patch.js';
import { Element } from "../html-element.js";
import assert from 'power-assert';

describe('vm.js', () => {

    describe('integration', () => {

        var elm, vnode0;

        beforeEach(function() {
            elm = document.createElement('x-foo');
            vnode0 = elm;
        });

        it('should assign uid=0 during construction', () => {
            let uid;
            class MyComponent1 extends Element {
                constructor() {
                    super();
                    uid = vnode0.vm.uid;
                }
            }
            vnode0 = api.c('x-foo', MyComponent1, {});
            patch(elm, vnode0);
            assert.strictEqual(uid, 0);
        });

        it('should assign uid>0 after insertion', () => {
            class MyComponent2 extends Element {}
            vnode0 = api.c('x-foo', MyComponent2, {});
            patch(elm, vnode0);
            assert(vnode0.vm.uid > 0);
        });

        it('should assign uid=0 after removal', () => {
            document.body.appendChild(elm); // destroy hook is only invoked if the element is trully in the DOM :/
            class MyComponent3 extends Element {}
            vnode0 = api.c('x-foo', MyComponent3, {});
            patch(elm, vnode0);
            const vnode1 = api.h('div', {}, []);
            patch(vnode0, vnode1);
            assert.strictEqual(vnode0.vm.uid, 0);
        });

        it('should assign bigger uid to children', () => {
            class ChildComponent41 extends Element {}
            const vnodeChild = api.c('x-bar', ChildComponent41, {});
            class MyComponent4 extends Element {
                render() {
                    return () => [vnodeChild];
                }
            }
            vnode0 = api.c('x-foo', MyComponent4, {});
            patch(elm, vnode0);
            assert(vnode0.vm.uid > 0);
            assert(vnodeChild.vm.uid > vnode0.vm.uid);
        });

        it('should assign bigger uid on reinsertion, including children uuid', () => {
            document.body.appendChild(elm); // destroy hook is only invoked if the element is trully in the DOM :/
            let counter = 0;
            class ChildComponent51 extends Element {
                render() {
                    counter++;
                }
            }
            let vnodeChild;
            class MyComponent5 extends Element {
                render() {
                    vnodeChild = api.c('x-bar', ChildComponent51, {});
                    return () => [vnodeChild];
                }
            }
            vnode0 = api.c('x-foo', MyComponent5, {});
            patch(elm, vnode0); // insertion
            const firstUID = vnode0.vm.uid;
            const vnode1 = api.h('div', {}, []);
            patch(vnode0, vnode1); // removal
            assert.strictEqual(vnode0.vm.uid, 0);
            assert.strictEqual(vnodeChild.vm.uid, 0);
            patch(vnode1, vnode0); // re-insertion
            assert(vnode0.vm.uid > firstUID);
            assert(vnodeChild.vm.uid > vnode0.vm.uid);
            assert.strictEqual(2, counter);
        });

    });

});
