import * as target from '../template.js';
import * as api from "../api.js";
import { patch } from '../patch.js';
import { Element } from "../html-element.js";
import assert from 'power-assert';

function createCustomComponent(html) {
    let vnode;
    const def = class MyComponent extends Element {
        render() {
            target.evaluateTemplate(html, vnode.vm);
        }
    }
    const elm = document.createElement('x-foo');
    vnode = api.c('x-foo', def);
    return patch(elm, vnode);
}

describe('template.js', () => {

    describe('rendering phase', () => {

        it('should provide four arguments', () => {
            let $api, $cmp, $slotset, $context;
            const vnode = createCustomComponent(function html($a, $c, $s, $ctx) {
                $api = $a;
                $cmp = $c;
                $slotset = $s;
                $context = $ctx;
            });
            assert.strictEqual($api, api, 'api ns object should be provided');
            assert($cmp && typeof $cmp === 'object', 'cmp should be provided');
            assert($slotset && typeof $slotset === 'object', 'slotset should be provided');
            assert.strictEqual($context, vnode.vm.context, 'vm.context should be provided');
        });

        it('should revoke cmp and slotset proxies', () => {
            let $cmp, $slotset;
            const vnode = createCustomComponent(function ($a, $c, $s) {
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
            const def = class MyComponent extends Element {
                get x() {
                    counter += 1;
                }
                get y() {
                    counter += 1;
                }
                render() {
                    target.evaluateTemplate(function (api, cmp, slotset, context) {
                        cmp.x;
                        cmp.y;
                        cmp.x;
                        cmp.y;
                    }, vnode.vm);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def);
            patch(elm, vnode);
            assert.strictEqual(counter, 2);
        });

        it('should not prevent or cache a getter calling another getter', () => {
            let counter = 0;
            let vnode;
            const def = class MyComponent extends Element {
                get x() {
                    counter += 1;
                    this.y; // accessing another getter
                    return 1;
                }
                get y() {
                    counter += 1;
                }
                render() {
                    target.evaluateTemplate(function (api, cmp, slotset, context) {
                        cmp.x;
                        cmp.y;
                    }, vnode.vm);
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', def);
            patch(elm, vnode);
            assert.strictEqual(counter, 3);
        });

        it('should throw when attempting to set a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset, context) {
                slotset.x = [];
            }));
        });

        it('should throw when attempting to set a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset, context) {
                cmp.x = [];
            }));
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset, context) {
                delete slotset.x;
            }));
        });

        it('should throw when attempting to delete a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset, context) {
                delete cmp.x;
            }));
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
            assert.deepEqual([{
                sel: 'p',
                data: {},
                children: undefined,
                text: undefined,
                elm: elm,
                key: undefined,
            }], result);
        });

    });

});
