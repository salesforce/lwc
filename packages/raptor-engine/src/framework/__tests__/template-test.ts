import * as target from '../template';
import * as api from "../api";
import { patch } from '../patch';
import { Element } from "../html-element";
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

describe('template', () => {

    describe('integration', () => {

        it('should provide four arguments', () => {
            let $api, $cmp, $slotset, $memoizer;
            createCustomComponent(function html($a, $c, $s, $m) {
                $api = $a;
                $cmp = $c;
                $slotset = $s;
                $memoizer = $m;
                return [];
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
                return [];
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
                        return [];
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
                        return [];
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
                return [];
            }));
        });

        it('should throw when attempting to set a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp) {
                cmp.x = [];
                return [];
            }));
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset) {
                delete slotset.x;
                return [];
            }));
        });

        it('should throw when attempting to delete a property member of cmp', () => {
            assert.throws(() => createCustomComponent(function (api, cmp) {
                delete cmp.x;
                return [];
            }));
        });

        it('should support switching templates', () => {
            let counter = 0;
            let vnode;
            let value;
            function html1(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
                return [];
            }
            function html2(api, cmp, slotset, memoizer) {
                memoizer.m0 = memoizer.m0 || cmp.x;
                value = memoizer.m0;
                return [];
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

        it('should support array of vnode', () => {
            let vnode;
            function html() {
                return [api.t('some text')];
            }
            class MyComponent3 extends Element {
                render() {
                    return html;
                }
            }
            const elm = document.createElement('x-foo');
            vnode = api.c('x-foo', MyComponent3, {});
            patch(elm, vnode);
            assert.strictEqual('some text', elm.textContent);
        });

    });

    describe('evaluateTemplate()', () => {

        it('should throw for undefined value', () => {
            assert.throws(() => {
                target.evaluateTemplate({ component: 1 }, undefined);
            });
        });

        it('should throw for null value', () => {
            assert.throws(() => {
                target.evaluateTemplate({ component: 1 }, null);
            });
        });
        it('should throw for empty values', () => {
            assert.throws(() => {
                target.evaluateTemplate({ component: 1 }, "");
            });
        });

        it('should throw for dom elements', () => {
            const elm = document.createElement('p');
            assert.throws(() => {
                target.evaluateTemplate({ component: 1 }, elm);
            });
        });

        it('should throw for array of dom elements', () => {
            const elm = document.createElement('p');
            assert.throws(() => {
                target.evaluateTemplate({ component: 1 }, [elm]);
            });
        });

    });

});
