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
            assert.deepEqual(o, foo, 'assignment on tracked property should work as expected');
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
            assert.deepEqual(o, foo, 'assignment on tracked property should work as expected');
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

});
