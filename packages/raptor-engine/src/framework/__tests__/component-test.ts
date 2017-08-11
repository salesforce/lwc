import * as target from '../component';
import assert from 'power-assert';
import { Element } from "../html-element";
import * as api from "../api";
import { patch } from '../patch';
import { createElement } from "../upgrade";

describe('component', function () {

    describe('#createComponent()', () => {
        it('should throw for non-object values', () => {
            assert.throws(() => target.createComponent(undefined), "undefined value");
            assert.throws(() => target.createComponent(""), "empty string value");
            assert.throws(() => target.createComponent(NaN), "NaN value");
            assert.throws(() => target.createComponent(function () {}));
            assert.throws(() => target.createComponent(1), "Number value");
        });
    });


    describe('attribute-change-life-cycle', () => {
        it('should not invoke attributeChangeCallback() when initializing props', () => {
            let counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 1;
                }
                attributeChangedCallback() {
                    counter++;
                }
            }
            MyComponent.publicProps = {x: true}
            MyComponent.observedAttributes = ['x'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                assert.strictEqual(0, counter);
            });
        });
        it('should invoke attributeChangeCallback() with previous value from constructor', () => {
            let keyValue, oldValue, newValue, counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.x = 1;
                }
                attributeChangedCallback(k, o, n) {
                    oldValue = o;
                    newValue = n;
                    keyValue = k;
                    counter++;
                }
            }
            MyComponent.publicProps = {x: true}
            MyComponent.observedAttributes = ['x'];
            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { props: { x: 2 } });
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                assert.strictEqual(1, counter);
                assert.strictEqual('x', keyValue);
                assert.strictEqual(1, oldValue);
                assert.strictEqual(2, newValue);
            });
        });
    });

    describe('public computed props', () => {
        it('should allow public getters', function () {
            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast () {
                    return this.value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            class Parent extends Element {
                value = 'salad';
                get lunch () {
                    return this.value;
                }

                render () {
                    return () => [api.c('x-component', MyComponent, {})];
                }
            }

            Parent.publicProps = {
                lunch: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Parent, {});
            patch(elm, vnode);
            assert.deepEqual(elm.lunch, 'salad');
            assert.deepEqual(elm.querySelector('x-component').breakfast, 'pancakes');
        });

        it('should not allow public getters to be set by owner', function () {
            class MyComponent extends Element  {
                get x () {
                    return 1;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, { props: { x: 2 } });
            // x can't be set via props, only read via getter
            assert.throws(() => patch(elm, vnode));
        });

        it('should be render reactive', function () {
            class MyComponent extends Element  {
                state = { value: 0 };

                get validity () {
                    return this.state.value > 5;
                }

                render () {
                    return ($api, $cmp, $slotset, $ctx) => {
                        return [$api.h('div', {}, [$api.d($cmp.validity)])];
                    }
                }
            }

            MyComponent.publicProps = {
                validity: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            vnode.vm.component.state.value = 10;
            return Promise.resolve().then(() => {
                assert.deepEqual(elm.textContent, 'true');
            });
        });

        it('should call public getter with correct context', function () {
            let context;

            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast () {
                    context = this;
                    return this.value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            vnode.vm.component.breakfast;
            assert.deepEqual(context, vnode.vm.component);
        });

        it('should not execute setter function when used directly from DOM', function () {
            let callCount = 0;

            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast () {
                    return this.value;
                }

                set breakfast (value) {
                    callCount += 1;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 3
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            elm.breakfast = 'hey';
            assert.deepEqual(callCount, 0);
        });

        it('should execute setter function with correct context when component is root', function () {
            let callCount = 0;
            let context;
            let component;

            class MyComponent extends Element  {
                constructor () {
                    super();
                    component = this;
                }

                value = 'pancakes';
                get breakfast () {
                    return this.value;
                }

                set breakfast (value) {
                    context = this;
                    callCount += 1;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 3
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });

            elm.breakfast = 'eggs';
            assert.deepEqual(callCount, 1);
            assert.deepEqual(component, context);
        });

        it('should call setter with correct context when template value is updated', function () {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast () {
                    return this.value;
                }

                set breakfast (value) {
                    callCount += 1;
                    context = this;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 3
                }
            };

            const elm = document.createElement('div');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            const nextVNode = api.c('x-foo', MyComponent, { props: { breakfast: 'eggs' } });
            patch(elm, vnode);
            patch(vnode, nextVNode);
            assert.deepEqual(callCount, 1);
            assert.deepEqual(context, nextVNode.vm.component);
        });

        it('should call setter when default value is provided', function () {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {
                value;
                breakfast = 'pancakes';
                get breakfast () {
                    return this.value;
                }

                set breakfast (value) {
                    callCount += 1;
                    context = this;
                    this.value = value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 3
                }
            };

            const elm = document.createElement('div');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            assert.deepEqual(callCount, 1);
            assert.deepEqual(context, vnode.vm.component);
        });

        it('should throw when configured prop is missing getter', function () {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {
                set breakfast (value) {

                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            const elm = document.createElement('div');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            expect(() => {
                patch(elm, vnode);
            }).toThrow();
        });

        it('should throw when configured prop is missing setter', function () {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {

            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 2
                }
            };

            const elm = document.createElement('div');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            expect(() => {
                patch(elm, vnode);
            }).toThrow();
        });
    });

    describe('styles', function () {
        it('should handle string styles', function () {
            let calledCSSText = false;
            class MyComponent extends Element  {
                state = {
                    customStyle: 'color: red'
                }

                render () {
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [$api.h(
                            "section",
                            {
                                style: $cmp.state.customStyle
                            },
                            []
                        )];
                    }
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});

            const cssTextPropDef = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get: function () {
                    return cssTextPropDef.get.call(this);
                },
                set: function (value) {
                    calledCSSText = true;
                    return cssTextPropDef.set.call(this, value);
                }
            });

            patch(elm, vnode);

            return Promise.resolve().then(() => {
                assert.deepEqual(elm.querySelector('section').style.cssText, 'color: red;');
                assert.deepEqual(calledCSSText, true);
            });
        });

        it('should handle undefined properly', function () {
            let calledCSSTextWithUndefined = false;
            class MyComponent extends Element  {
                state = {
                    customStyle: undefined
                }

                render () {
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [$api.h(
                            "section",
                            {
                                style: $cmp.state.customStyle
                            },
                            []
                        )];
                    }
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});

            const cssTextPropDef = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get: function () {
                    return cssTextPropDef.get.call(this);
                },
                set: function (value) {
                    if (value === 'undefined') {
                        calledCSSTextWithUndefined = true;
                    }
                    return cssTextPropDef.set.call(this, value);
                }
            });

            patch(elm, vnode);

            return Promise.resolve().then(() => {
                assert.deepEqual(elm.style.cssText, '');
                assert.deepEqual(calledCSSTextWithUndefined, false);
            });
        });

        it('should handle null properly', function () {
            let styleString;
            class MyComponent extends Element  {
                state = {
                    customStyle: null
                }

                render () {
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [$api.h(
                            "section",
                            {
                                style: $cmp.state.customStyle
                            },
                            []
                        )];
                    }
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});

            patch(elm, vnode);

            return Promise.resolve().then(() => {
                assert.deepEqual(elm.style.cssText, '');
            });
        });

        it('should diff between style objects and strings correctly', function () {
            let called = false;
            class MyComponent extends Element  {
                state = {
                    customStyle: {
                        color: 'red'
                    }
                }

                render () {
                    return function tmpl($api, $cmp, $slotset, $ctx) {
                        return [$api.h(
                            "section",
                            {
                                style: $cmp.state.customStyle
                            },
                            []
                        )];
                    }
                }
            }

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            const section = elm.querySelector('section');
            section.style.removeProperty = function () {
                called = true;
            };
            vnode.vm.component.state.customStyle = 'color:green';

            return Promise.resolve().then(() => {
                assert.deepEqual(called, false);
            });
        });
    });

    describe('public methods', () => {
        it('should not invoke function when accessing public method', function () {
            let callCount = 0;

            class MyComponent extends Element  {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);

            elm.m;
            assert.deepEqual(callCount, 0);
        });

        it('should invoke function only once', function () {
            let callCount = 0;

            class MyComponent extends Element  {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);

            elm.m();
            assert.deepEqual(callCount, 1);
        });

        it('should call function with correct context', function () {
            let context, args;

            class MyComponent extends Element  {
                m() {
                    context = this;
                    args = Array.prototype.slice.call(arguments);
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);

            elm.m(1, 2);
            assert.deepEqual(context, vnode.vm.component);
            assert.deepEqual(args, [1, 2]);
        });

        it('should express function identity with strict equality', function () {
            class MyComponent extends Element  {
                m() {
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);

            assert.strictEqual(elm.m, elm.m);
        });
     });
});
