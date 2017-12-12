import * as target from "../def";
import { Element } from "../html-element";

describe('def', () => {
    describe('#getComponentDef()', () => {
        it('should understand empty constructors', () => {
            const def = class MyComponent extends Element {}
            expect(() => {
                target.getComponentDef(def)
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
            const def = class MyComponent {}
            expect(() => target.getComponentDef(def)).toThrow();
        });

        it('should understand static observedAttributes', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['title', 'tabindex'];

            expect(target.getComponentDef(MyComponent).observedAttrs).toEqual({
                title: 1,
                tabindex: 1,
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
            }).toThrow();
        });

        it('should throw error when observedAttribute references setter', () => {
            class MyComponent extends Element  {
                get isRecordDetail () {}
                set isRecordDetail (value) {}
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
                get isRecordDetail () {}
                set isRecordDetail (value) {}
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
            expect(target.getComponentDef(MyComponent).props).toEqual({
                foo: {
                    config: 1,
                },
                xBar: {
                    config: 0
                }
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
                },
                xBar: {
                    config: 3,
                },
                fizz: {
                    config: 0
                },
                x: {
                    config: 1,
                }
            });
        });

        it('should throw if setter is declared without a getter', function () {
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

            expect(target.getComponentDef(MySubComponent).methods).toEqual({
                foo: 1,
                bar: 1,
                fizz: 1,
                buzz: 1
            });
        });

        it('should not inherit observedAttrs, it must be a manual process', function () {
            class MyComponent extends Element {}
            MyComponent.observedAttributes = ['title', 'tabindex'];

            class MySubComponent extends MyComponent {}
            MySubComponent.observedAttributes = ['title', 'id'];

            expect(target.getComponentDef(MySubComponent).observedAttrs).toEqual({
                title: 1,
                id: 1
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

        it('should handle publicProps with empty object', function () {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                foo: {}
            };
            expect(target.getComponentDef(MyComponent).props).toEqual({
                foo: {
                    config: 0
                }
            });
        });
    });
});
