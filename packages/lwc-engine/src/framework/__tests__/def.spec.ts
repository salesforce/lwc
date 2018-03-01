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
                accessKey: {
                    config: 3
                },
                ariaActiveDescendant:{
                    config: 3,
                },
                ariaAtomic: {
                    config: 3,
                },
                ariaAutocomplete: {
                    config: 3,
                },
                ariaBusy: {
                    config: 3,
                },
                ariaChecked: {
                    config: 3,
                },
                ariaControls: {
                    config: 3,
                },
                ariaCurrent: {
                    config: 3,
                },
                ariaDescribedBy: {
                    config: 3,
                },
                ariaDisabled: {
                    config: 3,
                },
                ariaDragged: {
                    config: 3,
                },
                ariaDropEffect: {
                    config: 3,
                },
                ariaExpanded: {
                    config: 3,
                },
                ariaFlowTo: {
                    config: 3,
                },
                ariaHasPopUp: {
                    config: 3,
                },
                ariaHidden: {
                    config: 3,
                },
                ariaInvalid: {
                    config: 3,
                },
                ariaLabel: {
                    config: 3,
                },
                ariaLabelledBy: {
                    config: 3,
                },
                ariaLevel: {
                    config: 3,
                },
                ariaLive: {
                    config: 3,
                },
                ariaMultiSelectable: {
                    config: 3,
                },
                ariaMultiline: {
                    config: 3,
                },
                ariaOrientation: {
                    config: 3,
                },
                ariaOwns: {
                    config: 3,
                },
                ariaPosInSet: {
                    config: 3,
                },
                ariaPressed: {
                    config: 3,
                },
                ariaReadonly: {
                    config: 3,
                },
                ariaRelevant: {
                    config: 3,
                },
                ariaRequired: {
                    config: 3,
                },
                ariaSelected: {
                    config: 3,
                },
                ariaSetSize: {
                    config: 3,
                },
                ariaSort: {
                    config: 3,
                },
                ariaValueMax: {
                    config: 3,
                },
                ariaValueMin: {
                    config: 3,
                },
                ariaValueNow: {
                    config: 3,
                },
                ariaValueText: {
                    config: 3,
                },
                dir: {
                    config: 3
                },
                draggable: {
                    config: 3
                },
                foo: {
                    config: 1,
                    type: 'any',
                },
                hidden: {
                    config: 3
                },
                id: {
                    config: 3
                },
                lang: {
                    config: 3
                },
                role: {
                    config: 3,
                },
                tabIndex: {
                    config: 3
                },
                title: {
                    config: 3
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
                accessKey: {
                    config: 3
                },
                ariaActiveDescendant:{
                  config: 3,
                },
                ariaAtomic: {
                  config: 3,
                },
                ariaAutocomplete: {
                  config: 3,
                },
                ariaBusy: {
                  config: 3,
                },
                ariaChecked: {
                  config: 3,
                },
                ariaControls: {
                  config: 3,
                },
                ariaCurrent: {
                  config: 3,
                },
                ariaDescribedBy: {
                  config: 3,
                },
                ariaDisabled: {
                  config: 3,
                },
                ariaDragged: {
                  config: 3,
                },
                ariaDropEffect: {
                  config: 3,
                },
                ariaExpanded: {
                  config: 3,
                },
                ariaFlowTo: {
                  config: 3,
                },
                ariaHasPopUp: {
                  config: 3,
                },
                ariaHidden: {
                  config: 3,
                },
                ariaInvalid: {
                  config: 3,
                },
                ariaLabel: {
                  config: 3,
                },
                ariaLabelledBy: {
                  config: 3,
                },
                ariaLevel: {
                  config: 3,
                },
                ariaLive: {
                  config: 3,
                },
                ariaMultiSelectable: {
                  config: 3,
                },
                ariaMultiline: {
                  config: 3,
                },
                ariaOrientation: {
                  config: 3,
                },
                ariaOwns: {
                  config: 3,
                },
                ariaPosInSet: {
                  config: 3,
                },
                ariaPressed: {
                  config: 3,
                },
                ariaReadonly: {
                  config: 3,
                },
                ariaRelevant: {
                  config: 3,
                },
                ariaRequired: {
                  config: 3,
                },
                ariaSelected: {
                  config: 3,
                },
                ariaSetSize: {
                  config: 3,
                },
                ariaSort: {
                  config: 3,
                },
                ariaValueMax: {
                  config: 3,
                },
                ariaValueMin: {
                  config: 3,
                },
                ariaValueNow: {
                  config: 3,
                },
                ariaValueText: {
                  config: 3,
                },
                dir: {
                    config: 3
                },
                draggable: {
                    config: 3
                },
                foo: {
                    config: 1,
                    type: 'any',
                },
                hidden: {
                    config: 3
                },
                id: {
                    config: 3
                },
                lang: {
                    config: 3
                },
                role: {
                    config: 3,
                },
                tabIndex: {
                    config: 3
                },
                title: {
                    config: 3
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
                },
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
                accessKey: {
                    config: 3
                },
                ariaActiveDescendant:{
                    config: 3,
                },
                ariaAtomic: {
                    config: 3,
                },
                ariaAutocomplete: {
                    config: 3,
                },
                ariaBusy: {
                    config: 3,
                },
                ariaChecked: {
                    config: 3,
                },
                ariaControls: {
                    config: 3,
                },
                ariaCurrent: {
                    config: 3,
                },
                ariaDescribedBy: {
                    config: 3,
                },
                ariaDisabled: {
                    config: 3,
                },
                ariaDragged: {
                    config: 3,
                },
                ariaDropEffect: {
                    config: 3,
                },
                ariaExpanded: {
                    config: 3,
                },
                ariaFlowTo: {
                    config: 3,
                },
                ariaHasPopUp: {
                    config: 3,
                },
                ariaHidden: {
                    config: 3,
                },
                ariaInvalid: {
                    config: 3,
                },
                ariaLabel: {
                    config: 3,
                },
                ariaLabelledBy: {
                    config: 3,
                },
                ariaLevel: {
                    config: 3,
                },
                ariaLive: {
                    config: 3,
                },
                ariaMultiSelectable: {
                    config: 3,
                },
                ariaMultiline: {
                    config: 3,
                },
                ariaOrientation: {
                    config: 3,
                },
                ariaOwns: {
                    config: 3,
                },
                ariaPosInSet: {
                    config: 3,
                },
                ariaPressed: {
                    config: 3,
                },
                ariaReadonly: {
                    config: 3,
                },
                ariaRelevant: {
                    config: 3,
                },
                ariaRequired: {
                    config: 3,
                },
                ariaSelected: {
                    config: 3,
                },
                ariaSetSize: {
                    config: 3,
                },
                ariaSort: {
                    config: 3,
                },
                ariaValueMax: {
                    config: 3,
                },
                ariaValueMin: {
                    config: 3,
                },
                ariaValueNow: {
                    config: 3,
                },
                ariaValueText: {
                    config: 3,
                },
                dir: {
                    config: 3
                },
                draggable: {
                    config: 3
                },
                foo: {
                    config: 0,
                    type: 'any',
                },
                hidden: {
                    config: 3
                },
                id: {
                    config: 3
                },
                lang: {
                    config: 3
                },
                role: {
                    config: 3
                },
                tabIndex: {
                    config: 3
                },
                title: {
                    config: 3
                },
            });
        });
    });
});
