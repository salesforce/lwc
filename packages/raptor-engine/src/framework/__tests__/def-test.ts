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
            MyComponent.publicProps = {
                foo: {
                    config: 0
                },
                xBar: {
                    config: 0
                }
            };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {
                    foo: {
                        config: 0
                    },
                    xBar: {
                        config: 0
                    }
                },
                methods: {},
                observedAttrs: {
                    foo: 1,
                    'x-bar': 1,
                },
            });
        });

        it('should not throw error when observedAttribute is kebab case and is public prop', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['is-record-detail'];
            MyComponent.publicProps = {
                isRecordDetail: {
                    config: 0
                }
            };
            expect(() => {
                target.getComponentDef(MyComponent);
            }).not.toThrow();
        });

        it('should throw error when observedAttribute is misspelled global attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['contentEditable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "contentEditable" in component MyComponent observedAttributes. "contentEditable" is not a valid global HTML Attribute. Did you mean "contenteditable"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes');
        });

        it('should throw error when observedAttribute is kebab case global attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['content-editable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "content-editable" in component MyComponent observedAttributes. "content-editable" is not a valid global HTML Attribute. Did you mean "contenteditable"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes');
        });

        it('should throw error when observedAttribute is camelCased and is public prop', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['isRecordDetail'];
            MyComponent.publicProps = {
                isRecordDetail: {
                    config: 0
                }
            };
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "isRecordDetail" in component MyComponent observedAttributes. Did you mean "is-record-detail"?');
        });

        it('should throw error when observedAttribute references setter', () => {
            class MyComponent extends Element  {
                set isRecordDetail () {}
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['is-record-detail'];
            MyComponent.publicProps = {
                isRecordDetail: {
                    config: 2
                }
            };
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "is-record-detail" in component MyComponent observedAttributes. Use existing "isRecordDetail" setter to track changes.');
        });

        it('should throw error when observedAttribute references computed prop', () => {
            class MyComponent extends Element  {
                get isRecordDetail () {}
                set isRecordDetail () {}
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['is-record-detail'];
            MyComponent.publicProps = {
                isRecordDetail: {
                    config: 3
                }
            };
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "is-record-detail" in component MyComponent observedAttributes. Use existing "isRecordDetail" setter to track changes.');
        });

        it('should throw error when observedAttribute is not a valid global HTML attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['isRecordDetail'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "isRecordDetail" in component MyComponent observedAttributes. "isRecordDetail" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes');
        });

        it('should not throw error when observedAttribute is a valid global HTML attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['contenteditable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).not.toThrow();
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
            function foo() {}
            class MyComponent extends Element  {}
            Object.defineProperties(MyComponent.prototype, {
                foo: { get: foo, configurable: true }
            });
            MyComponent.publicProps = {
                foo: {
                    config: 1
                },
                xBar: {},
            };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {
                    foo: {
                        config: 1,
                        getter: foo,
                    },
                    xBar: {
                        config: 0
                    }
                },
                methods: {},
                observedAttrs: {},
            });
        });

        it('should inherit props correctly', function () {
            function x() {}
            class MySuperComponent extends Element {}
            Object.defineProperties(MySuperComponent.prototype, {
                x: { get: x, configurable: true }
            });

            MySuperComponent.publicProps = {
                x: {
                    config: 1
                }
            };

            function foo() {}
            function xBarGet() {}
            function xBarSet() {}
            class MyComponent extends MySuperComponent {}
            Object.defineProperties(MyComponent.prototype, {
                foo: { set: foo, configurable: true },
                xBar: { get: xBarGet, set: xBarSet, configurable: true },
            });

            MyComponent.publicProps = {
                foo: {
                    config: 2
                },
                xBar: {
                    config: 3
                },
            };

            class MySubComponent extends MyComponent {}

            MySubComponent.publicProps = {
                fizz: {}
            };

            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                props: {
                    foo: {
                        config: 2,
                        setter: foo,
                    },
                    xBar: {
                        config: 3,
                        getter: xBarGet,
                        setter: xBarSet,
                    },
                    fizz: {
                        config: 0
                    },
                    x: {
                        config: 1,
                        getter: x,
                    }
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
            MyComponent.publicProps = {
                foo: {
                    config: 0
                },
                bar: {
                    config: 0
                }
            }

            MyComponent.observedAttributes = ['foo', 'bar'];

            class MySubComponent extends MyComponent {}

            MySubComponent.publicProps = {
                fizz: {
                    config: 0
                },
                buzz: {
                    config: 0
                }
            }

            MySubComponent.observedAttributes = ['fizz', 'buzz'];

            assert.deepEqual(target.getComponentDef(MySubComponent), {
                name: 'MySubComponent',
                props: {
                    foo: {
                        config: 0
                    },
                    bar: {
                        config: 0
                    },
                    fizz: {
                        config: 0
                    },
                    buzz: {
                        config: 0
                    }
                },
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

        it('should handle publicProps with empty object', function () {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                foo: {}
            };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                wire: undefined,
                props: {
                    foo: {
                        config: 0
                    }
                },
                methods: {},
                observedAttrs: {},
            });
        });

    });
});
