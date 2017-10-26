import * as target from '../template';
import * as api from "../api";
import { patch } from '../patch';
import { Element } from "../html-element";
import { createElement } from './../main';

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
            expect($api).toBe(api);
            expect($cmp && typeof $cmp === 'object').toBe(true);
            expect($slotset && typeof $slotset === 'object').toBe(true);
            expect($memoizer).toEqual({});
        });

        it('should revoke slotset proxy', () => {
            let $slotset;
            createCustomComponent(
                function($a, $c, $s) {
                    $slotset = $s;
                    return [];
                },
                { x: [api.h('p', {}, [])] },
            );
            expect(() => $slotset.x).toThrow('Cannot perform \'get\' on a proxy that has been revoked');
            expect(() => {
                $slotset.foo
            }).toThrow();
        });

        it('should render arrays correctly', function () {
            const vnode = createCustomComponent(function ($api, $cmp) {
                return $api.i(['a', 'b'], function (value) {
                    return $api.h('div', {}, [
                        $api.t(value)
                    ])
                })
            });
            expect(vnode.elm.querySelectorAll('div').length).toBe(2);
            expect(vnode.elm.querySelectorAll('div')[0].textContent).toBe('a');
            expect(vnode.elm.querySelectorAll('div')[1].textContent).toBe('b');
        });

        it('should render sets correctly', function () {
            const set = new Set();
            set.add('a');
            set.add('b');
            const vnode = createCustomComponent(function ($api, $cmp) {
                return $api.i(set, function (value) {
                    return $api.h('div', {}, [
                        $api.t(value)
                    ])
                })
            });
            expect(vnode.elm.querySelectorAll('div').length).toBe(2);
            expect(vnode.elm.querySelectorAll('div')[0].textContent).toBe('a');
            expect(vnode.elm.querySelectorAll('div')[1].textContent).toBe('b');
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
            expect(counter).toBe(3);
        });

        it('should throw when attempting to set a property member of slotset', () => {
            expect(() =>
                createCustomComponent(
                    function(api, cmp, slotset) {
                        slotset.x = [];
                        return [];
                    },
                    { x: [api.h('p', {}, [])] },
                ),
            ).toThrow();
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
            expect(() => patch(elm, vnode)).toThrow();
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            expect(() => {
                createCustomComponent(function (api, cmp, slotset) {
                    delete slotset.x;
                    return [];
                }, { x: [ api.h('p', {}, []) ] });
            }).toThrow();
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
            expect(counter).toBe(2);
            expect(value).toBe('two');
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
            expect(elm.textContent).toBe('some text');
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
            expect(elm.x).toBe(vnode.vm.component.x);
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should profixied property objects', () => {
            const x = [1, 2, 3];
            class MyComponentParent extends Element {
                state = { x: undefined };
                constructor() {
                    super();
                    this.state.x = x;
                }

                get stateX() {
                    return this.state.x;
                }

                render () {
                    return function ($api, $cmp) {
                        return [
                            $api.c('x-child', MyComponentChild, { props: { x: $cmp.state.x }})
                        ]
                    }
                }
            }
            MyComponentParent.publicProps = { stateX: {
                config: 1
            } };
            MyComponentParent.track = { state: 1 }
            class MyComponentChild extends Element {}
            MyComponentChild.publicProps = { x: true };
            const elm1 = createElement('x-parent', { is: MyComponentParent });
            document.body.appendChild(elm1);
            const elm2 = elm1.querySelector('x-child');
            expect(elm2.x).not.toBe(x);
            expect(elm1.stateX).toBe(elm2.x);
            expect(x).toEqual(elm2.x);
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

            expect(typeof x).toBe("function");
            expect(x).toBe(y);
        });

    });

    describe('evaluateTemplate()', () => {

        it('should throw for undefined value', () => {
            expect(() => {
                target.evaluateTemplate({ component: 1 }, undefined);
            }).toThrow();
        });

        it('should throw for null value', () => {
            expect(() => {
                target.evaluateTemplate({ component: 1 }, null);
            }).toThrow();
        });
        it('should throw for empty values', () => {
            expect(() => {
                target.evaluateTemplate({ component: 1 }, "");
            }).toThrow();
        });

        it('should throw for dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                target.evaluateTemplate({ component: 1 }, elm);
            }).toThrow();
        });

        it('should throw for array of dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                target.evaluateTemplate({ component: 1 }, [elm]);
            }).toThrow();
        });
    });
});
