import { Element } from "../../html-element";
import { createElement } from "../../upgrade";
import assert from 'power-assert';

describe('track.ts', () => {

    describe('integration', () => {

        it('should support setting a tracked property in constructor', () => {
            let foo = undefined;
            const o = { x: 1 };
            class MyComponent extends Element {
                constructor() {
                    super();
                    assert('foo' in this, 'tracked property should be defined on component');
                    this.foo = o;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(o).toEqual(foo);
            assert(o !== foo, 'tracked property was not profixied');
        });

        it('should support tracked properties', () => {
            let foo = undefined;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const o = { x: 1 };
            elm.injectFoo(o);
            expect(o).toEqual(foo);
            assert(o !== foo, 'tracked property was not profixied');
        });

        it('should make tracked properties reactive', () => {
            let counter = 0;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                }
                constructor() {
                    super();
                    this.foo = { x: 1 };
                }
                render() {
                    counter++;
                    this.foo.x;
                }
            }
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo({ x: 2 });
            return Promise.resolve().then(() => {
                assert.strictEqual(2, counter);
            });
        });

        it('should make properties of a tracked object property reactive', () => {
            let counter = 0;
            class MyComponent extends Element {
                injectFooDotX(x) {
                    this.foo.x = x;
                }
                constructor() {
                    super();
                    this.foo = { x: 1 };
                }
                render() {
                    counter++;
                    this.foo.x;
                }
            }
            MyComponent.track = { foo: 1 };
            MyComponent.publicMethods = ['injectFooDotX'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFooDotX(2);
            return Promise.resolve().then(() => {
                assert.strictEqual(2, counter);
            });
        });

        it('should not proxify primitive value', function () {
            let foo = undefined;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(1);
            assert.strictEqual(foo, 1);
        });

        it('should proxify plain arrays', function () {
            let foo = undefined;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const a = [];
            elm.injectFoo(a);
            assert(foo !== a);
        });

        it('should not proxify exotic objects', function () {
            let foo = undefined;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const d = Date.now();
            elm.injectFoo(d);
            assert.strictEqual(foo, d);
        });

        it('should not proxify non-observable object', function () {
            let foo = undefined;
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    foo = this.foo;
                }
            }
            MyComponent.track = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const o = Object.create({});
            elm.injectFoo(o);
            assert.strictEqual(foo, o);
        });

        it('should not throw an error if track is observable object', function () {
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                }
            }
            MyComponent.track = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.injectFoo({});
            }).not.toThrow();
        });

        it('should throw a track property is mutated during rendering', function () {
            class MyComponent extends Element {
                render() {
                    this.foo = 1;
                }
            }
            MyComponent.track = { foo: {  } };
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });

    });

    describe('@track regression', () => {
        test(`#609 - each instance of the same object prototype should have it's own tracked property value`, () => {
            class XFoo extends Element  {
                constructor() {
                    super();
                    this.counter = 0;
                }
            }

            XFoo.track = { counter: 0 };

            const elm1 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm1);

            const elm2 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm2);

            const elm1NewVal = 1;
            const elm2NewVal = 2;

            elm1.counter = elm1NewVal;
            elm2.counter = elm2NewVal;

            expect(elm1.counter).toBe(elm1NewVal)
            expect(elm2.counter).toBe(elm2NewVal);
        });
    });

        test(`#609 - instance of the same object prototype should not share values of tracked properties`, () => {
            class XFoo extends Element  {
                constructor() {
                    super();
                    this.counter = 0;
                    this.label = 3;
                }
            }

            XFoo.track = { counter: 1, label:1 };

            const elm1 = createElement('x-foo', { is: XFoo });
            document.body.appendChild(elm1);

            const countVal = 1;
            const labelVal = 4;

            elm1.counter = countVal;
            elm1.label = labelVal;

            expect(elm1.counter).toBe(countVal);
        });

});
