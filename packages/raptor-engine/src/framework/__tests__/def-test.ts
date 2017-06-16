import * as target from "../def";
import { Element } from "../html-element";
import assert from 'power-assert';

describe('def', () => {
    describe('#getComponentDef()', () => {

        it('should understand empty constructors', () => {
            const def = class MyComponent extends Element {}
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                wire: undefined,
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should prevent mutations of important keys but should allow expondos for memoization and polyfills', () => {
            class MyComponent extends Element {}
            const def = target.getComponentDef(MyComponent);
            assert.throws(() => {
                def.name = 'something else';
            });
            def.expando = 1;
            assert.equal(1, def.expando);
        });

        it('should throw for stateful components not extending Element', () => {
            const def = class MyComponent {}
            assert.throws(() => target.getComponentDef(def));
        });

        it('should understand static observedAttributes', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['foo', 'x-bar'];
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {},
                methods: {},
                observedAttrs: {
                    foo: 1,
                    "x-bar": 1,
                },
            });
        });

        it('should understand static publicMethods', () => {
            class MyComponent extends Element  {
                foo() {}
                bar() {}
            }
            MyComponent.publicMethods = ['foo', 'bar'];
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {},
                methods: {
                    foo: 1,
                    bar: 1,
                },
                observedAttrs: {},
            });
        });


        it('should understand static wire', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: { x: { type: 'record' } },
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should infer attribute name from public props', () => {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                foo: true,
                xBar: {},
            };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {
                    foo: 1,
                    xBar: 1,
                },
                methods: {},
                observedAttrs: {},
            });
        });

        it('should inherit props correctly', function () {
            class MySuperComponent extends Element {}

            MySuperComponent.publicProps = {
                super: true
            };

            class MyComponent extends MySuperComponent {}

            MyComponent.publicProps = {
                foo: true,
                xBar: {},
            };

            class MySubComponent extends MyComponent {}

            MySubComponent.publicProps = {
                fizz: 'buzz'
            };

            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                props: {
                    foo: 1,
                    xBar: 1,
                    fizz: 1,
                    super: 1
                },
                observedAttrs: {},
                methods: {},
                wire: undefined,
            });
        });

        it('should inherit methods correctly', function () {
            class MyComponent extends Element {
                foo () {}
                bar () {}
            }

            MyComponent.publicMethods = ['foo', 'bar'];

            class MySubComponent extends MyComponent {
                fizz () {}
                buzz () {}
            }

            MySubComponent.publicMethods = ['fizz', 'buzz'];

            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                props: {},
                methods: {
                    foo: 1,
                    bar: 1,
                    fizz: 1,
                    buzz: 1
                },
                observedAttrs: {},
                wire: undefined,
            });
        });

        it('should not inherit observedAttrs, it must be a manual process', function () {
            class MyComponent extends Element {}

            MyComponent.observedAttributes = ['foo', 'bar'];

            class MySubComponent extends MyComponent {}

            MySubComponent.observedAttributes = ['fizz', 'buzz'];

            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                props: {},
                observedAttrs: {
                    fizz: 1,
                    buzz: 1
                },
                methods: {},
                wire: undefined,
            });
        });

        it('should inherit static wire properly', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { y: { type: 'record' } };
            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                wire: {
                    x: {
                        type: 'record'
                    },
                    y: {
                        type: 'record'
                    }
                },
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should inherit static wire properly when parent defines same property', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { x: { type: 'subrecord' } };
            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                wire: {
                    x: {
                        type: 'subrecord'
                    }
                },
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

    });
});
