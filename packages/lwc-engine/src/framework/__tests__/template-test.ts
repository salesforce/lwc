import * as target from '../template';
import * as globalApi from '../api';
import { Element } from "../html-element";
import { createElement } from './../main';
import { ViewModelReflection } from '../def';
import { Template } from '../template';

function createCustomComponent(html: Template, slotset?) {
    class MyComponent extends Element {
        render() {
            return html;
        }
    }
    const elm = createElement('x-foo', { is: MyComponent });
    elm[ViewModelReflection].cmpSlots = slotset;
    document.body.appendChild(elm);
    return elm;
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
            expect($api).toBe(globalApi);
            expect($cmp && typeof $cmp === 'object').toBe(true);
            expect($slotset && typeof $slotset === 'object').toBe(true);
            expect($memoizer).toEqual({});
        });

        it('should revoke slotset proxy', () => {
            let $slotset;
            createCustomComponent(
                function($api, $c, $s) {
                    $slotset = $s;
                    return [];
                },
                { x: [globalApi.h('p', { key: 0 }, [])] },
            );
            expect(() => $slotset.x).toThrow('Cannot perform \'get\' on a proxy that has been revoked');
            expect(() => {
                $slotset.foo;
            }).toThrow();
        });

        it('should render arrays correctly', function() {
            const elm = createCustomComponent(function($api, $cmp) {
                return $api.i(['a', 'b'], function(value) {
                    return $api.h('div', { key: 0 }, [
                        $api.t(value)
                    ]);
                });
            });
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div').length).toBe(2);
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div')[0].textContent).toBe('a');
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div')[1].textContent).toBe('b');
        });

        it('should render sets correctly', function() {
            const set = new Set();
            set.add('a');
            set.add('b');
            const elm = createCustomComponent(function($api, $cmp) {
                return $api.i(set, function(value) {
                    return $api.h('div', { key: 0 }, [
                        $api.t(value)
                    ]);
                });
            });
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div').length).toBe(2);
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div')[0].textContent).toBe('a');
            expect(elm[ViewModelReflection].component.root.querySelectorAll('div')[1].textContent).toBe('b');
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
            function html($api, $cmp) {
                $cmp.x;
                $cmp.y;
                return [];
            }
            class MyComponent extends Element {
                get x() {
                    counter += 1;
                    this.y; // accessing another getter
                    return 1;
                }
                get y() {
                    counter += 1;
                    return;
                }
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(3);
        });

        it('should throw when attempting to set a property member of slotset', () => {
            expect(() =>
                createCustomComponent(
                    function($api, cmp, slotset) {
                        slotset.x = [];
                        return [];
                    },
                    { x: [globalApi.h('p', { key: 0 }, [])] },
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
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => document.body.appendChild(elm)).toThrow();
        });

        it('should throw when attempting to delete a property member of slotset', () => {
            expect(() => {
                createCustomComponent(function(api, cmp, slotset) {
                    delete slotset.x;
                    return [];
                }, { x: [ globalApi.h('p', { key: 0 }, []) ] });
            }).toThrow();
        });

        it('should support switching templates', () => {
            let counter = 0;
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
            const elm = createElement('x-foo', { is: MyComponent2 });
            elm.x = 'one';
            document.body.appendChild(elm);
            elm.x = 'two';
            return Promise.resolve().then(_ => {
                expect(counter).toBe(2);
                expect(value).toBe('two');
            });
        });

        it('should support array of vnode', () => {
            let vnode;
            function html($api) {
                return [$api.t('some text')];
            }
            class MyComponent3 extends Element {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent3 });
            document.body.appendChild(elm);
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
            const elm = createElement('x-foo', { is: MyComponent });
            expect(elm.x).toBe(elm[ViewModelReflection].component.x);
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should proxify property objects', () => {
            const x = [1, 2, 3];
            class MyComponent extends Element {}
            MyComponent.publicProps = {
                x: {
                    config: 0
                }
            };
            const elm = createElement('x-foo', { is: MyComponent });
            elm.x = x;
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should not create a proxy for methods used from tempalte', () => {
            let x, y;
            function html($api, $cmp) {
                y = $cmp.x;
                return [];
            }
            class MyComponent extends Element {
                constructor() {
                    super();
                    x = this.x;
                }
                x() {}
                render() {
                    return html;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
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

    describe('style', () => {
        it('should not render empty style attribute to DOM', () => {
            const tmpl = ($api, $cmp) => {
                return [$api.h('div', {
                    key: 1,
                    style: $cmp.getStyle,
                }, [])]
            }

            class MyComponent extends Element {
                get getStyle() {
                    return '';
                }
                render() {
                    return tmpl;
                }
            }

            const element = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(element);

            // there should not be a style="" attribute in the DOM
            expect(element.innerHTML).toBe('<div></div>');
        });
    })

    describe('token', () => {
        it('adds token to the host element if template has a token', () => {
            const styledTmpl: Template = () => [];
            styledTmpl.token = 'token';

            class Component extends Element {
                render() {
                    return styledTmpl;
                }
            }

            const cmp = createElement('x-cmp', { is: Component });

            expect(cmp.hasAttribute('token')).toBe(false);
            document.body.appendChild(cmp);
            expect(cmp.hasAttribute('token')).toBe(true);
        });

        it('removes token from the host element when changing template', () => {
            const styledTmpl: Template = () => [];
            styledTmpl.token = 'token';

            const unstyledTmpl: Template = () => [];

            class Component extends Element {
                tmpl = styledTmpl;
                render() {
                    return this.tmpl;
                }
            }
            Component.publicProps = {
                tmpl: { config: 0 }
            };

            const cmp = createElement('x-cmp', { is: Component });
            document.body.appendChild(cmp);

            expect(cmp.hasAttribute('token')).toBe(true);

            cmp.tmpl = unstyledTmpl;

            return Promise.resolve().then(() => {
                expect(cmp.hasAttribute('token')).toBe(false);
            });
        });

        it('swaps the token when replacing the template with a different token', () => {
            const styledTmplA: Template = () => [];
            styledTmplA.token = 'tokenA';

            const styledTmplB: Template = () => [];
            styledTmplB.token = 'tokenB';

            class Component extends Element {
                tmpl = styledTmplA;
                render() {
                    return this.tmpl;
                }
            }
            Component.publicProps = {
                tmpl: { config: 0 }
            };

            const cmp = createElement('x-cmp', { is: Component });
            document.body.appendChild(cmp);

            expect(cmp.hasAttribute('tokenA')).toBe(true);
            expect(cmp.hasAttribute('tokenB')).toBe(false);

            cmp.tmpl = styledTmplB;

            return Promise.resolve().then(() => {
                expect(cmp.hasAttribute('tokenA')).toBe(false);
                expect(cmp.hasAttribute('tokenB')).toBe(true);
            });
        });
    });

    describe('recycling', () => {
        it('should only occur if the same template is rendered', () => {
            function html($api, $cmp) {
                $cmp.x; // reaction
                return [$api.h('div', { key: 0 }, [])]
            }
            let div: HTMLElement;
            let counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 0;
                }
                render() {
                    return html;
                }
                renderedCallback() {
                    counter++;
                    div = this.root.querySelector('div');
                }
            }
            MyComponent.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            div.id = 'miami';
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
                expect(div.id).toBe('miami'); // this means the element was reused
            });
        });

        it('should not occur if the template is swapped', () => {
            function html1($api, $cmp) {
                $cmp.x; // reaction
                return [$api.h('div', { key: 0 }, [])]
            }
            function html2($api, $cmp) {
                $cmp.x; // reaction
                return [$api.h('div', { key: 0 }, [])]
            }
            let div: HTMLElement;
            let counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 0;
                }
                render() {
                    return this.x === 0 ? html1: html2;
                }
                renderedCallback() {
                    counter++;
                    div = this.root.querySelector('div');
                }
            }
            MyComponent.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            div.id = 'miami';
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
                expect(div.id).toBe(""); // this means the element was not reused
            });
        });
    });
});
