import * as target from "../def";
import { Element } from "../html-element";

describe('def', () => {
    describe('#getComponentDef()', () => {
        it('should understand empty constructors', () => {
            const def = class MyComponent extends Element {};
            expect(() => {
                target.getComponentDef(def);
            }).not.toThrow();
        });

        it('should prevent mutations of important keys but should allow expondos for memoization and polyfills', () => {
            class MyComponent extends Element {}
            const def = target.getComponentDef(MyComponent);
            expect(() => {
                def.name = 'something else';
            }).toThrow();

            def.expando = 1;
            expect(def.expando).toBe(1);
        });

        it('should throw for stateful components not extending Element', () => {
            const def = class MyComponent {};
            expect(() => target.getComponentDef(def)).toThrow();
        });

        it('should understand static observedAttributes', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['data-title', 'data-tabindex', 'aria-label'];

            expect(target.getComponentDef(MyComponent).observedAttrs).toEqual({
                'data-title': 1,
                'data-tabindex': 1,
                'aria-label': 1,
            });
        });

        it('should throw error when observedAttribute is kebab case and is public prop', () => {
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
            }).toThrow();
        });

        it('should throw error when observedAttribute is misspelled global attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['contentEditable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "contentEditable" in component MyComponent observedAttributes. Observed attributes can only contain "data-" and "aria-" attributes.');
        });

        it('should throw error when observedAttribute is kebab case global attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['content-editable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "content-editable" in component MyComponent observedAttributes. Observed attributes can only contain "data-" and "aria-" attributes.');
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
            }).toThrow();
        });

        it('should throw error when observedAttribute references setter', () => {
            class MyComponent extends Element  {
                get isRecordDetail() {}
                set isRecordDetail(value) {}
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
            }).toThrow();
        });

        it('should throw error when observedAttribute references computed prop', () => {
            class MyComponent extends Element  {
                get isRecordDetail() {}
                set isRecordDetail(value) {}
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
            }).toThrow();
        });

        it('should throw error when observedAttribute is not a valid global HTML attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['isRecordDetail'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow('Invalid entry "isRecordDetail" in component MyComponent observedAttributes. Observed attributes can only contain "data-" and "aria-" attributes.');
        });

        it('should throw error when observedAttribute is not a data- or aria- attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['contenteditable'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow();
        });

        it('should throw when trying to observed a non-standard aria- attribute', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['aria-foo'];
            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow();
        });

        it('should understand static publicMethods', () => {
            class MyComponent extends Element  {
                foo() {}
                bar() {}
            }
            MyComponent.publicMethods = ['foo', 'bar'];
            expect(target.getComponentDef(MyComponent).methods).toEqual({
                foo: 1,
                bar: 1,
            });
        });

        it('should understand static wire', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            expect(target.getComponentDef(MyComponent).wire).toEqual({ x: { type: 'record' } });
        });

        it('should infer config and type from public props without explicitly specifying them', () => {
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
            expect(target.getComponentDef(MyComponent).props).toEqual({
                foo: {
                    config: 1,
                    type: 'any',
                },
                xBar: {
                    config: 0,
                    type: 'any',
                }
            });
        });

        it('should inherit props correctly', function() {
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
                foo: { get: foo, configurable: true },
                xBar: { get: xBarGet, set: xBarSet, configurable: true },
            });

            MyComponent.publicProps = {
                foo: {
                    config: 1
                },
                xBar: {
                    config: 3
                },
            };

            class MySubComponent extends MyComponent {}

            MySubComponent.publicProps = {
                fizz: {}
            };

            expect(target.getComponentDef(MySubComponent).props).toEqual({
                foo: {
                    config: 1,
                    type: 'any',
                },
                xBar: {
                    config: 3,
                    type: 'any',
                },
                fizz: {
                    config: 0,
                    type: 'any',
                },
                x: {
                    config: 1,
                    type: 'any',
                }
            });
        });

        it('should throw if setter is declared without a getter', function() {
            function x() {}
            class MyComponent extends Element {}
            Object.defineProperties(MyComponent.prototype, {
                x: { set: x, configurable: true }
            });

            MyComponent.publicProps = {
                x: {
                    config: 1
                }
            };

            expect(() => {
                target.getComponentDef(MyComponent);
            }).toThrow();
        });

        it('should inherit methods correctly', function() {
            class MyComponent extends Element {
                foo() {}
                bar() {}
            }

            MyComponent.publicMethods = ['foo', 'bar'];

            class MySubComponent extends MyComponent {
                fizz() {}
                buzz() {}
            }

            MySubComponent.publicMethods = ['fizz', 'buzz'];

            expect(target.getComponentDef(MySubComponent).methods).toEqual({
                foo: 1,
                bar: 1,
                fizz: 1,
                buzz: 1
            });
        });

        it('should not inherit observedAttrs, it must be a manual process', function() {
            class MyComponent extends Element {}
            MyComponent.observedAttributes = ['data-title', 'data-tabindex'];

            class MySubComponent extends MyComponent {}
            MySubComponent.observedAttributes = ['data-title', 'data-id'];

            expect(target.getComponentDef(MySubComponent).observedAttrs).toEqual({
                'data-title': 1,
                'data-id': 1
            });
        });

        it('should inherit static wire properly', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { y: { type: 'record' } };
            expect(target.getComponentDef(MySubComponent).wire).toEqual({
                x: {
                    type: 'record'
                },
                y: {
                    type: 'record'
                }
            });
        });

        it('should inherit static wire properly when parent defines same property', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { x: { type: 'subrecord' } };
            expect(target.getComponentDef(MySubComponent).wire).toEqual({
                x: {
                    type: 'subrecord'
                }
            });
        });

        it('should handle publicProps with empty object', function() {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                foo: {}
            };
            expect(target.getComponentDef(MyComponent).props).toEqual({
                foo: {
                    config: 0,
                    type: 'any',
                }
            });
        });
    });
});
