import * as target from '../template';
import * as api from "../api";
import { patch } from '../patch';
import { Element } from "../html-element";
import assert from 'power-assert';

function createCustomComponent(html, slotset?) {
    let vnode;
    class MyComponent extends Element {
        render() {
            return html;
        }
    }
    const elm = document.createElement('x-foo');
    vnode = api.c('x-foo', MyComponent, { slotset });
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

        it('should revoke slotset proxy', () => {
            let $slotset;
            createCustomComponent(function ($a, $c, $s) {
                $slotset = $s;
                return [];
            }, { x: [ api.h('p', {}, []) ] });
            assert.throws(() => $slotset.x, 'slot name x');
            // assert.throws(() => $slotset.foo, 'unknown slot name'); // compat mode prevents this
        });

        // this test depends on the memoization
        // it('should prevent a getter to be accessed twice in the same render phase', () => {
        //     let counter = 0;
        //     let vnode;
        //     class MyComponent extends Element {
        //         get x() {
        //             counter += 1;
        //         }
        //         get y() {
        //             counter += 1;
        //         }
        //         render() {
        //             return function (api, cmp) {
        //                 cmp.x;
        //                 cmp.y;
        //                 cmp.x;
        //                 cmp.y;
        //                 return [];
        //             };
        //         }
        //     }
        //     const elm = document.createElement('x-foo');
        //     vnode = api.c('x-foo', MyComponent, {});
        //     patch(elm, vnode);
        //     assert.strictEqual(counter, 2);
        // });

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
            }, { x: [ api.h('p', {}, []) ] }));
        });

        it('should throw when attempting to set a property member of cmp', () => {
            function template(api, cmp) {
                cmp.x = [];
                return [];
            }
            template.ids = ['x'];
            class MyComponent extends Element {
                x = 1;
                render() {
                    return template;
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, {});
            assert.throws(() => patch(elm, vnode));
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            assert.throws(() => createCustomComponent(function (api, cmp, slotset) {
                delete slotset.x;
                return [];
            }, { x: [ api.h('p', {}, []) ] }));
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

        it('should profixied default objects', () => {
            const x = [1, 2, 3];
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = x;
                }
            }
            MyComponent.publicProps = { x: true };
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            assert(elm.x === vnode.vm.component.x, 'default property x should be accesible');
            assert(elm.x !== x, 'property x should be profixied');
            assert.deepEqual(elm.x, x, 'property x should match the original object x');
        });

        it('should profixied property objects', () => {
            const x = [1, 2, 3];
            class MyComponentParent extends Element {
                state = { x: undefined };
                constructor() {
                    super();
                    this.state.x = x;
                }
            }
            class MyComponentChild extends Element {
                constructor() {
                    super();
                }
            }
            MyComponentChild.publicProps = { x: true };
            const elm1 = document.createElement('x-parent');
            const elm2 = document.createElement('x-child');
            const vnode1 = api.c('x-parent', MyComponentParent, {});
            patch(elm1, vnode1);
            const vnode2 = api.c('x-child', MyComponentChild, { props: { x: vnode1.vm.component.state.x }});
            patch(elm2, vnode2);
            assert(elm2.x !== x, 'property x should be profixied');
            assert.strictEqual(vnode1.vm.component.state.x, vnode2.vm.component.x, 'proxified objects retain identity');
            assert.deepEqual(elm2.x, x, 'property x should match the passed property x');
        });

        it('should not profixied or bound methods', () => {
            let x, y;
            class MyComponent extends Element {
                constructor() {
                    super();
                    x = this.x;
                }
                x() {}
                render() {
                    return function ($api, $cmp) {
                        y = $cmp.x;
                        return [];
                    }
                }
            }
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            assert(typeof x === "function", 'x should have been set');
            assert.strictEqual(x, y, 'methods should not be bound or proxified');
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
