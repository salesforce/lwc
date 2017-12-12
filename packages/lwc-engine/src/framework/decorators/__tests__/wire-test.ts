import { Element } from "../../html-element";
import { createElement } from "../../upgrade";
import wire from "../wire";

describe('wire.ts', () => {
    describe('integration', () => {
        it('should support setting a wired property in constructor', () => {
            expect.assertions(3);

            const o = { x: 1 };
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect('foo' in this).toBe(true);
                    this.foo = o;

                    expect(this.foo).toEqual(o);
                    expect(this.foo).not.toBe(o);
                }
            }
            MyComponent.wire = { foo: {} };

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should support wired properties', () => {
            expect.assertions(2);

            const o = { x: 1 };
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toEqual(o);
                    expect(this.foo).not.toBe(o);
                }
            }
            MyComponent.wire = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(o);
        });

        it('should make wired properties reactive', () => {
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
            MyComponent.wire = { foo: {} };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo({ x: 2 });

            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should make properties of a wired object property reactive', () => {
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
            MyComponent.wire = { foo: {} };
            MyComponent.publicMethods = ['injectFooDotX'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFooDotX(2);

            return Promise.resolve().then(() => {
                expect(counter).toBe(2);
            });
        });

        it('should not proxify primitive value', function () {
            expect.assertions(1);

            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(1);
                }
            }
            MyComponent.wire = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(1);
        });

        it('should proxify plain arrays', function () {
            expect.assertions(2);

            const a = [];
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toEqual(a);
                    expect(this.foo).not.toBe(a);
                }
            }
            MyComponent.wire = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(a);
        });

        it('should not proxify exotic objects', function () {
            expect.assertions(1);

            const d = new Date();
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(d);
                }
            }
            MyComponent.wire = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(d);
        });

        it('should not proxify non-observable object', function () {
            expect.assertions(1);

            const o = Object.create({});
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                    expect(this.foo).toBe(o);
                }
            }
            MyComponent.wire = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            elm.injectFoo(o);
        });

        it('should not throw an error if wire is observable object', function () {
            class MyComponent extends Element {
                injectFoo(v) {
                    this.foo = v;
                }
            }
            MyComponent.wire = { foo: {  } };
            MyComponent.publicMethods = ['injectFoo'];
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(() => {
                elm.injectFoo({});
            }).not.toThrow();
        });

        it('should throw a wire property is mutated during rendering', function () {
            class MyComponent extends Element {
                render() {
                    this.foo = 1;
                }
            }
            MyComponent.wire = { foo: {  } };
            const elm = createElement('x-foo', { is: MyComponent });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrow();
        });

    });


    describe('@wire misuse', () => {
        it('should throw when invoking wire as a function', () => {
            class MyComponent extends Element {
                constructor() {
                    super();
                    wire();
                }
            }
            expect(() => {
                createElement('x-foo', { is: MyComponent });
            }).toThrow('@wire may only be used as a decorator.');
        });
    });

});
