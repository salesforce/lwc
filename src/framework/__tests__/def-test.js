import * as target from "../def.js";
import assert from 'power-assert';

describe('def.js', () => {
    describe('#getComponentDef()', () => {

        it('should understand empty constructors', () => {
            const def = class MyComponent {}
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                props: {},
                attrs: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should understand static observedAttributes', () => {
            const def = class MyComponent {
                static observedAttributes = ['foo', 'x-bar'];
            }
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                props: {},
                attrs: {},
                methods: {},
                observedAttrs: {
                    foo: 1,
                    "x-bar": 1,
                },
            });
        });

        it('should understand static publicMethods', () => {
            const def = class MyComponent {
                foo() {}
                bar() {}
                static publicMethods = ['foo', 'bar'];
            }
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                props: {},
                attrs: {},
                methods: {
                    foo: 1,
                    bar: 1,
                },
                observedAttrs: {},
            });
        });

        it('should infer attribute name from public props', () => {
            const def = class MyComponent {
                static publicProps = {
                    foo: 1,
                    xBar: 2,
                };
            }
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                props: {
                    foo: {
                        initializer: 1,
                        attrName: 'foo',
                    },
                    xBar: {
                        initializer: 2,
                        attrName: 'x-bar',
                    },
                },
                attrs: {
                    foo: {
                        propName: 'foo',
                    },
                    "x-bar": {
                        propName: 'xBar',
                    },
                },
                methods: {},
                observedAttrs: {},
            });
        });

    });
});
