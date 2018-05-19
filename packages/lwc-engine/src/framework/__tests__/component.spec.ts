import * as target from '../component';
import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { ViewModelReflection } from '../def';

describe('component', function() {
    describe('#createComponent()', () => {
        it('should throw for non-object values', () => {
            expect(() => target.createComponent(undefined)).toThrow();
            expect(() => target.createComponent("")).toThrow();
            expect(() => target.createComponent(NaN)).toThrow();
            expect(() => target.createComponent(function() {})).toThrow();
            expect(() => target.createComponent(1)).toThrow();
        });
    });

    describe('public computed props', () => {
        it('should allow public getters', function() {
            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };
            function html($api) {
                return [$api.c('x-component', MyComponent, {})];
            }
            class Parent extends Element {
                value = 'salad';
                get lunch() {
                    return this.value;
                }

                render() {
                    return html;
                }
            }

            Parent.publicProps = {
                lunch: {
                    config: 1
                }
            };

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.lunch).toBe('salad');
            expect(elm[ViewModelReflection].component.template.querySelector('x-component').breakfast).toBe('pancakes');
        });

        it('should allow calling public getters when element is accessed by querySelector', function() {
            const count = 0;
            let value;
            const propVal = { foo: 'bar' };
            class MyChild extends Element {
                m = propVal;
            }
            MyChild.publicProps = {
                m: {
                    config: 0
                }
            };
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                callChildM() {
                    value = this.template.querySelector('x-child').m;
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['callChildM'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.callChildM();
            }).not.toThrow();
        });

        it('should not allow public getters to be set by owner', function() {
            class MyComponent extends Element  {
                get x() {
                    return 1;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 1
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            // x can't be set via props, only read via getter
            expect(() => elm.x = 1).toThrow();
        });

        it('should be render reactive', function() {
            function html($api, $cmp, $slotset, $ctx) {
                return [$api.h('div', { key: 0 }, [$api.d($cmp.validity)])];
            }
            class MyComponent extends Element  {
                state = { value: 0 };

                get validity() {
                    return this.state.value > 5;
                }

                updateTrackedValue(value: number) {
                    this.state.value = value;
                }

                render() {
                    return html;
                }
            }

            MyComponent.track = { state: 1 };
            MyComponent.publicProps = {
                validity: {
                    config: 1
                }
            };
            MyComponent.publicMethods = ['updateTrackedValue'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.updateTrackedValue(10);
            return Promise.resolve().then(() => {
                expect(elm.textContent).toBe('true');
            });
        });

        it('should call public getter with correct context', function() {
            let context;

            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast() {
                    context = this;
                    return this.value;
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.breakfast;
            expect(context).toBe(elm[ViewModelReflection].component);
        });

        it('should call setter function when used directly from DOM', function() {
            class MyChild extends Element {
                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
                    this.value = value;
                }
            }
            MyChild.publicProps = {
                breakfast: {
                    config: 3
                }
            };
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('x-child').breakfast = 'eggs';
                    return this.template.querySelector('x-child').breakfast;
                }
            }
            MyComponent.publicMethods = ['run'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.run()).toBe('eggs');
        });

        it('should execute setter function with correct context when component is root', function() {
            let callCount = 0;
            let context;
            let component;

            class MyComponent extends Element  {
                constructor() {
                    super();
                    component = this;
                }

                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
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
            expect(callCount).toBe(1);
            expect(component).toBe(context);
        });

        it('should call setter with correct context when template value is updated', function() {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {
                value = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
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

            const elm = createElement('x-foo', { is: MyComponent });
            elm.breakfast = 'eggs';
            expect(callCount).toBe(1);
            expect(context).toBe(elm[ViewModelReflection].component);
        });

        it('should call setter when default value is provided', function() {
            let callCount = 0;
            let context;

            class MyComponent extends Element  {
                value;
                breakfast = 'pancakes';
                get breakfast() {
                    return this.value;
                }

                set breakfast(value) {
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

            const elm = createElement('x-foo', { is: MyComponent });
            expect(callCount).toBe(1);
            expect(context).toBe(elm[ViewModelReflection].component);
        });

        it('should throw when configured prop is missing getter', function() {
            class MyComponent extends Element  {
                set breakfast(value) {}
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow();
        });

        it('should throw when configured prop is missing setter', function() {
            class MyComponent extends Element  {
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 2
                }
            };

            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow();
        });
    });

    describe('styles', function() {
        it('should handle string styles', function() {
            let calledCSSText = false;
            function html($api, $cmp) {
                return [$api.h(
                    "section",
                    {
                        key: 0,
                        style: $cmp.state.customStyle
                    },
                    []
                )];
            }
            class MyComponent extends Element  {
                state = {
                    customStyle: 'color: red'
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    calledCSSText = true;
                    return cssTextPropDef.set.call(this, value);
                }
            });
            document.body.appendChild(elm);
            expect(elm[ViewModelReflection].component.template.querySelector('section').style.cssText).toBe('color: red;');
            expect(calledCSSText).toBe(true);
        });

        it('should handle undefined properly', function() {
            let calledCSSTextWithUndefined = false;
            function html($api, $cmp, $slotset, $ctx) {
                return [$api.h(
                    "section",
                    {
                        key: 0,
                        style: $cmp.state.customStyle
                    },
                    []
                )];
            }
            class MyComponent extends Element  {
                state = {
                    customStyle: undefined
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            const cssTextPropDef = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
            Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
                get() {
                    return cssTextPropDef.get.call(this);
                },
                set(value) {
                    if (value === 'undefined') {
                        calledCSSTextWithUndefined = true;
                    }
                    return cssTextPropDef.set.call(this, value);
                }
            });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
            expect(calledCSSTextWithUndefined).toBe(false);
        });

        it('should handle null properly', function() {
            function html($api, $cmp) {
                return [$api.h(
                    "section",
                    {
                        key: 0,
                        style: $cmp.state.customStyle
                    },
                    []
                )];
            }
            class MyComponent extends Element  {
                state = {
                    customStyle: null
                };

                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.style.cssText).toBe('');
        });

        it('should diff between style objects and strings correctly', function() {
            let called = false;
            function html($api, $cmp, $slotset, $ctx) {
                return [$api.h(
                    "section",
                    {
                        key: 0,
                        style: $cmp.state.customStyle
                    },
                    []
                )];
            }
            class MyComponent extends Element  {
                state = {
                    customStyle: {
                        color: 'red'
                    }
                };

                render() {
                    return html;
                }
            }
            MyComponent.track = { state: 1 };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const section = elm[ViewModelReflection].component.template.querySelector('section');
            section.style.removeProperty = function() {
                called = true;
            };
            elm[ViewModelReflection].component.state.customStyle = 'color:green';
            return Promise.resolve().then(_ => {
                expect(called).toBe(false);
            });
        });
    });

    describe('public methods', () => {
        it('should not invoke function when accessing public method', function() {
            let callCount = 0;

            class MyComponent extends Element  {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m;
            expect(callCount).toBe(0);
        });

        it('should invoke function only once', function() {
            let callCount = 0;

            class MyComponent extends Element  {
                m() {
                    callCount += 1;
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m();
            expect(callCount).toBe(1);
        });

        it('should call function with correct context and arguments', function() {
            let context, args;

            class MyComponent extends Element  {
                m() {
                    context = this;
                    args = Array.prototype.slice.call(arguments);
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            elm.m(1, 2);
            expect(context).toBe(elm[ViewModelReflection].component);
            expect(args).toEqual([1, 2]);
        });

        it('should express function identity with strict equality', function() {
            class MyComponent extends Element  {
                m() {
                }
            }
            MyComponent.publicMethods = ['m'];

            const elm = createElement('x-foo', { is: MyComponent });
            expect(elm.m).toBe(elm.m);
        });

        it('should allow calling methods when element is referenced with querySelector', function() {
            let count = 0;
            class MyChild extends Element {
                m() {
                    count += 1;
                }
            }
            MyChild.publicMethods = ['m'];
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                callChildM() {
                    this.template.querySelector('x-child').m();
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['callChildM'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.callChildM();
            }).not.toThrow();
            expect(count).toBe(1);
        });

        it('should allow calling getAttribute on child when referenced with querySelector', function() {
            let count = 0;
            class MyChild extends Element {
                m() {
                    count += 1;
                }
            }
            MyChild.publicMethods = ['m'];
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                getChildAttribute() {
                    this.template.querySelector('x-child').getAttribute('title');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['getChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.getChildAttribute();
            }).not.toThrow();
        });

        it('should allow calling setAttribute on child when referenced with querySelector', function() {
            let count = 0;
            class MyChild extends Element {
                m() {
                    count += 1;
                }
            }
            MyChild.publicMethods = ['m'];
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                setChildAttribute() {
                    this.template.querySelector('x-child').setAttribute('title', 'foo');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['setChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.setChildAttribute();
            }).not.toThrow();
        });

        it('should allow calling removeAttribute on child when referenced with querySelector', function() {
            let count = 0;
            class MyChild extends Element {
                m() {
                    count += 1;
                }
            }
            MyChild.publicMethods = ['m'];
            function html($api) {
                return [$api.c('x-child', MyChild, {})];
            }
            class MyComponent extends Element  {
                removeChildAttribute() {
                    this.template.querySelector('x-child').removeAttribute('title');
                }
                render() {
                    return html;
                }
            }
            MyComponent.publicMethods = ['removeChildAttribute'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.removeChildAttribute();
            }).not.toThrow();
        });
     });
});
