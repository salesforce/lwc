import { createElement, LightningElement } from '../main';
import { getHostShadowRoot } from '../html-element';

function createCustomComponent(html) {
    class MyComponent extends LightningElement {
        render() {
            return html;
        }
    }
    const elm = createElement('x-foo', { is: MyComponent });
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

            expect($api && typeof $api === 'object').toBe(true);
            expect($cmp && typeof $cmp === 'object').toBe(true);
            expect($slotset && typeof $slotset === 'object').toBe(true);
            expect($memoizer).toEqual({});
        });

        it('should render arrays correctly', function() {
            const elm = createCustomComponent(function($api, $cmp) {
                return $api.i(['a', 'b'], function(value) {
                    return $api.h('div', { key: 0 }, [
                        $api.t(value)
                    ]);
                });
            });
            expect(
                getHostShadowRoot(elm).querySelectorAll('div').length
            ).toBe(2);
            expect(
                getHostShadowRoot(elm).querySelectorAll('div')[0].textContent
            ).toBe('a');
            expect(
                getHostShadowRoot(elm).querySelectorAll('div')[1].textContent
            ).toBe('b');
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
            expect(
                getHostShadowRoot(elm).querySelectorAll('div').length
            ).toBe(2);
            expect(
                getHostShadowRoot(elm).querySelectorAll('div')[0].textContent
            ).toBe('a');
            expect(
                getHostShadowRoot(elm).querySelectorAll('div')[1].textContent
            ).toBe('b');
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
            class MyComponent extends LightningElement {
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

        it('should throw when attempting to set a property member of cmp', () => {
            function template(api, cmp) {
                cmp.x = [];
                return [];
            }
            template.ids = ['x'];
            class MyComponent extends LightningElement {
                x = 1;
                render() {
                    return template;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => document.body.appendChild(elm)).toThrow();
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
            class MyComponent2 extends LightningElement {
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
            class MyComponent3 extends LightningElement {
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

            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    this.x = x;
                }

                getX() {
                    return this.x;
                }
            }

            MyComponent.publicProps = { x: true };
            MyComponent.publicMethods = ['getX'];

            const elm = createElement('x-foo', { is: MyComponent });

            expect(elm.x).toBe(elm.getX());
            expect(elm.x).not.toBe(x);
            expect(elm.x).toEqual(x);
        });

        it('should proxify property objects', () => {
            const x = [1, 2, 3];
            class MyComponent extends LightningElement {}
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
            class MyComponent extends LightningElement {
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
                createCustomComponent(() => undefined)
            }).toThrow();
        });

        it('should throw for null value', () => {
            expect(() => {
                createCustomComponent(() =>  null)
            }).toThrow();
        });
        it('should throw for empty values', () => {
            expect(() => {
                createCustomComponent(() =>  '')
            }).toThrow();
        });

        it('should throw for dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                createCustomComponent(() =>  elm)
            }).toThrow();
        });

        it('should throw for array of dom elements', () => {
            const elm = document.createElement('p');
            expect(() => {
                createCustomComponent(() =>  [elm])
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

            class MyComponent extends LightningElement {
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
        it('adds the host token to the host element if template has a token', () => {
            const styledTmpl = () => [];
            styledTmpl.hostToken = 'token-host';

            class Component extends LightningElement {
                render() {
                    return styledTmpl;
                }
            }

            const cmp = createElement('x-cmp', { is: Component });

            expect(cmp.hasAttribute('token-host')).toBe(false);
            document.body.appendChild(cmp);
            expect(cmp.hasAttribute('token-host')).toBe(true);
        });

        it('adds the token to all the rendered elements if the template has a token', () => {
            const styledTmpl = ($api) => [
                $api.h('div', {
                    key: 1,
                }, [
                    $api.h('div', {
                        key: 2,
                    }, [])
                ]),
            ];
            styledTmpl.shadowToken = 'token';

            class Component extends LightningElement {
                render() {
                    return styledTmpl;
                }
            }

            const cmp = createElement('x-cmp', { is: Component });
            document.body.appendChild(cmp);

            const divs = getHostShadowRoot(cmp).querySelectorAll('div[token]');
            expect(divs.length).toBe(2);
        });

        it('removes the host token from the host element when changing template', () => {
            const styledTmpl = () => [];
            styledTmpl.hostToken = 'token-host';

            const unstyledTmpl = () => [];

            class Component extends LightningElement {
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

            expect(cmp.hasAttribute('token-host')).toBe(true);

            cmp.tmpl = unstyledTmpl;

            return Promise.resolve().then(() => {
                expect(cmp.hasAttribute('token-host')).toBe(false);
            });
        });

        it('swaps the host token when replacing the template with a different token', () => {
            const styledTmplA = () => [];
            styledTmplA.hostToken = 'tokenA-host';

            const styledTmplB = () => [];
            styledTmplB.hostToken = 'tokenB-host';

            class Component extends LightningElement {
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

            expect(cmp.hasAttribute('tokenA-host')).toBe(true);
            expect(cmp.hasAttribute('tokenB-host')).toBe(false);

            cmp.tmpl = styledTmplB;

            return Promise.resolve().then(() => {
                expect(cmp.hasAttribute('tokenA-host')).toBe(false);
                expect(cmp.hasAttribute('tokenB-host')).toBe(true);
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
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    this.x = 0;
                }
                render() {
                    return html;
                }
                renderedCallback() {
                    counter++;
                    div = this.template.querySelector('div');
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
            class MyComponent extends LightningElement {
                constructor() {
                    super();
                    this.x = 0;
                }
                render() {
                    return this.x === 0 ? html1: html2;
                }
                renderedCallback() {
                    counter++;
                    div = this.template.querySelector('div');
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

    describe('Attributes', () => {
        it('should render attributes correctly', () => {
            const tmpl = ($api, $cmp) => {
                return [$api.h('div', {
                    attrs: {
                        title: 'foo',
                    },
                    key: 1,
                    style: $cmp.getStyle,
                }, [])]
            }

            class MyComponent extends LightningElement {
                render() {
                    return tmpl;
                }
            }

            const element = createElement('x-attr-cmp', { is: MyComponent });
            document.body.appendChild(element);

            const div = getHostShadowRoot(element).querySelector('div');
            expect(div.getAttribute('title')).toBe('foo');
        });

        it('should remove attribute when value is null', () => {
            const tmpl = ($api, $cmp) => {
                return [$api.h('div', {
                    attrs: {
                        title: $cmp._inner,
                    },
                    key: 1,
                    style: $cmp.getStyle,
                }, [])]
            }

            class MyComponent extends LightningElement {
                _inner = 'initial',
                setInner(value) {
                    this._inner = value;
                }
                render() {
                    return tmpl;
                }
            }

            MyComponent.publicMethods = ['setInner'];
            MyComponent.track = {
                _inner: 1,
            };

            const element = createElement('x-attr-cmp', { is: MyComponent });
            document.body.appendChild(element);

            expect(getHostShadowRoot(element).querySelector('div').getAttribute('title')).toBe('initial');
            element.setInner(null);
            return Promise.resolve().then(() => {
                expect(getHostShadowRoot(element).querySelector('div').hasAttribute('title')).toBe(false);
            });
        });
    });
});
