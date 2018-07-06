import { createElement, LightningElement } from '../../main';
import { getHostShadowRoot } from "../../html-element";

describe('decorators/api.ts', () => {
    describe('@api x', () => {
        it('should allow inheriting public props', function() {
            class MyComponent extends LightningElement  {
                constructor() {
                    super();
                    this.breakfast = 'pancakes';
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 0
                }
            };
            function html($api) {
                return [$api.c('x-component', MyComponent, {})];
            }
            class Parent extends LightningElement {
                constructor() {
                    super();
                    this.parentGetter = 'parentgetter';
                }
                render() {
                    return html;
                }
            }

            Parent.publicProps = {
                parentGetter: {
                    config: 0
                }
            };

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.parentGetter).toBe('parentgetter');
            expect(getHostShadowRoot(elm).querySelector('x-component').breakfast).toBe('pancakes');
        });

        it('should not be consider properties reactive if not used in render', function() {
            let counter = 0;
            class MyComponent extends LightningElement  {
                render() {
                    counter++;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 0
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.x = 10;
            return Promise.resolve().then(() => {
                expect(counter).toBe(1);
            });
        });

        it('should consider tracked property reactive if used in render', function() {
            let counter = 0;
            class MyComponent extends LightningElement  {
                render() {
                    this.x;
                    counter++;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 0
                }
            };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.x = 10;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should allow access to public props from outside and from templates', function() {
            function html($api, $cmp, $slotset, $ctx) {
                return [$api.h('div', { key: 0 }, [$api.d($cmp.x)])];
            }
            class MyComponent extends LightningElement  {
                render() {
                    return html;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 0
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            elm.x = 'foo';
            document.body.appendChild(elm);
            expect(elm.x).toBe('foo');
            expect(elm.textContent).toBe('foo');
        });

    });

    describe('@api get/set x', () => {
        it('should allow public getters', function() {
            class MyComponent extends LightningElement  {
                get breakfast() {
                    return 'pancakes';
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
            class Parent extends LightningElement {
                get parentGetter() {
                    return 'parentgetter';
                }

                render() {
                    return html;
                }
            }

            Parent.publicProps = {
                parentGetter: {
                    config: 1
                }
            };

            const elm = createElement('x-foo', { is: Parent });
            document.body.appendChild(elm);
            expect(elm.parentGetter).toBe('parentgetter');
            expect(getHostShadowRoot(elm).querySelector('x-component').breakfast).toBe('pancakes');
        });

        it('should not be consider getter and setters reactive', function() {
            let counter = 0;
            class MyComponent extends LightningElement  {
                get x() {
                    return 1;
                }
                set x(v) {}

                render() {
                    this.x;
                    counter++;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 3
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.x = 10;
            return Promise.resolve().then(() => {
                expect(counter).toBe(1);
            });
        });

        it('should consider tracked property reactive if used via getter and setter', function() {
            let counter = 0;
            class MyComponent extends LightningElement  {
                get x() {
                    return this.y;
                }
                set x(v) {
                    this.y = v;
                }

                render() {
                    this.x;
                    counter++;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 3
                }
            };
            MyComponent.track = {
                y: 1
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(counter).toBe(1);
            elm.x = 10;
            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should allow access simple getters from outside and from templates', function() {
            function html ($api, $cmp, $slotset, $ctx) {
                return [$api.h('div', { key: 0 }, [$api.d($cmp.validity)])];
            }
            class MyComponent extends LightningElement  {
                get validity() {
                    return 'foo';
                }

                render() {
                    return html;
                }
            }

            MyComponent.publicProps = {
                validity: {
                    config: 1
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.validity).toBe('foo');
            expect(elm.textContent).toBe('foo');
        });

        it('should allow calling the getter during construction', function() {
            class MyComponent extends LightningElement  {
                get x() {
                    return 1;
                }
                set x(v) {}

                constructor() {
                    super();
                    this.x;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 3
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.x).toBe(1);
        });

        it('should allow calling the setter during construction', function() {
            class MyComponent extends LightningElement  {
                get x() {
                    return 1;
                }
                set x(v) {}

                constructor() {
                    super();
                    this.x = 2;
                }
            }

            MyComponent.publicProps = {
                x: {
                    config: 3
                }
            };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(elm.x).toBe(1);
        });
    });

    describe('@api foo()', () => {
        it('should allow inheriting public methods', function() {
            class MyComponent extends LightningElement  {
                x() {
                    return 1;
                }
            }

            MyComponent.publicMethods = ['x'];

            class ChildComponent extends MyComponent {
                y() {
                    return 2;
                }
            }

            ChildComponent.publicMethods = ['y'];

            const elm = createElement('x-foo', { is: ChildComponent });
            document.body.appendChild(elm);
            expect(elm.x()).toBe(1);
            expect(elm.y()).toBe(2);
        });

        it('should preserve the context in public methods', function() {
            let args, ctx, that;
            class MyComponent extends LightningElement  {
                constructor() {
                    super();
                    that = this;
                }
                x() {
                    args = Array.prototype.slice.call(arguments);
                    ctx = this;
                }
            }

            MyComponent.publicMethods = ['x'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.x(10, 20);
            expect(that).toBe(ctx);
            expect(args).toEqual([10, 20]);
        });
    });

    describe('@api regression', () => {
        test(`#608 - each instance should have its own version of the property`, () => {
            const originalValue = 0;
            const newValue = 100;

            class XFoo extends LightningElement  {
                constructor() {
                    super();
                    this.counter = originalValue;
                }
            }

            XFoo.publicProps = {
                counter: { config: 0 }
            };

            const elm1 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm1);

            const elm2 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm2);

            elm1.counter = newValue;
            expect(elm1.counter).toBe(newValue);
            expect(elm2.counter).toBe(originalValue);
        });
    });

});
