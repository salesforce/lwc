import * as target from '../template.js';
import * as api from "../api.js";
import { patch } from '../patch.js';
import { Element } from "../html-element.js";
import assert from 'power-assert';

function createCustomComponent(html) {
    let vnode;
    class MyComponent extends Element {
        render() {
            return html;
        }
    }
    const elm = document.createElement('x-foo');
    vnode = api.c('x-foo', MyComponent, {});
    return patch(elm, vnode);
}

describe('template.js', () => {

    describe('integration', () => {

        it('should provide four arguments', () => {
            let $api, $cmp, $slotset, $memoizer;
            createCustomComponent(function html($a, $c, $s, $m) {
                $api = $a;
                $cmp = $c;
                $slotset = $s;
                $memoizer = $m;
            });
            assert.strictEqual($api, api, 'api ns object should be provided');
            assert($cmp && typeof $cmp === 'object', 'cmp should be provided');
            assert($slotset && typeof $slotset === 'object', 'slotset should be provided');
            assert.deepEqual({}, $memoizer, 'memoizer should be provided');
        });

        it('should revoke cmp and slotset proxies', () => {
            let $cmp, $slotset;
            createCustomComponent(function ($a, $c, $s) {
                $cmp = $c;
                $slotset = $s;
            });
            assert.throws(() => $cmp.state, 'state property member');
            assert.throws(() => $cmp.foo, 'unknown property member');
            assert.throws(() => $slotset.$default$, 'default slot name');
            assert.throws(() => $slotset.foo, 'unknown slot name');
        });

        it('should prevent a getter to be accessed twice in the same render phase', () => {
            let counter = 0;
            let vnode;
            class MyComponent extends Element {
                get x() {
                    counter += 1;
                }
                get y() {
                    counter += 1;
                }
                render() {
                    return function (api, cmp) {
                        cmp.x;
                        cmp.y;
                        cmp.x;
                        cmp.y;
                    };
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            assert.strictEqual(counter, 2);
        });

        it('should not prevent or cache a getter calling another getter', () => {
            let counter = 0;
            let vnode;
            class MyComponent extends Element {
                get x() {
                    counter += 1;
                    this.y; // accessing another getter
                    return 1;
                }
                get y() {
                    counter += 1;
                }
                render() {
                    return function (api, cmp) {
                        cmp.x;
                        cmp.y;
                    };
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            assert.strictEqual(counter, 3);
        });

        it('should throw when attempting to set a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset) {
                slotset.x = [];
            }));
        });

        it('should throw when attempting to set a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp) {
                cmp.x = [];
            }));
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset) {
                delete slotset.x;
            }));
        });

        it('should throw when attempting to delete a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp) {
                delete cmp.x;
            }));
        });

        it('should support switching templates', () => {
            let counter = 0;
            let vnode;
            let value;
            function html1(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
            }
            function html2(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
            }
            class MyComponent2 extends Element {
                render() {
                    counter++;
                    if (counter === 1) {
                        return html1;
                    }
                    return html2;
                }
            }
            MyComponent2.publicProps = { x: true };
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', MyComponent2, { props: { x: 'one' } });
            patch(elm, vnode); // insertion
            const vnode1 = api.c('x-foo', MyComponent2, { props: { x: 'two' } });
            patch(vnode, vnode1); // reaction
            assert.strictEqual(2, counter);
            assert.strictEqual('two', value);
        });

    });

    describe('evaluateTemplate()', () => {

        it('should normalize empty values', () => {
            let result
            result = target.evaluateTemplate(undefined, { component: 1 });
            assert.deepEqual(result, [], 'undefined');
            result = target.evaluateTemplate(null, { component: 1 });
            assert.deepEqual(result, [], 'null');
            result = target.evaluateTemplate("", { component: 1 });
            assert.deepEqual(result, [], 'empty string');
        });

        it('should normalize dom elements', () => {
            let result
            const elm = document.createElement('p');
            result = target.evaluateTemplate(elm, { component: 1 });
            assert(Array.isArray(result), 'return an array');
            assert(result.length === 1, 'with one element');
        });

        it('should normalize array of dom elements', () => {
            let result
            const elm = document.createElement('p');
            result = target.evaluateTemplate([elm], { component: 1 });
            assert.equal(result.length, 1, 'single child');
            assert.equal(result[0].sel, 'p', 'selector');
            assert.deepEqual(result[0].data, {}, 'data');
        });

    });

});
