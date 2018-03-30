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
            const { props } = target.getComponentDef(MyComponent);
            expect(props.foo).toEqual({
                config: 1,
                type: 'any',
                attr: 'foo',
            });
            expect(props.xBar).toEqual({
                config: 0,
                type: 'any',
                attr: 'x-bar',
            });
        });

        it('should provide default html props', () => {
            function foo() {}
            class MyComponent extends Element  {}
            expect(Object.keys(target.getComponentDef(MyComponent).props).reduce((reducer, propName) => {
                reducer[propName] = null;
                return reducer;
            }, {})).toEqual({
                accessKey: null,
                ariaActiveDescendant: null,
                ariaAtomic: null,
                ariaAutoComplete: null,
                ariaBusy: null,
                ariaChecked: null,
                ariaControls: null,
                ariaCurrent: null,
                ariaDescribedBy: null,
                ariaDisabled: null,
                ariaExpanded: null,
                ariaFlowTo: null,
                ariaHasPopUp: null,
                ariaHidden: null,
                ariaInvalid: null,
                ariaLabel: null,
                ariaLabelledBy: null,
                ariaLevel: null,
                ariaLive: null,
                ariaMultiSelectable: null,
                ariaMultiLine: null,
                ariaOrientation: null,
                ariaOwns: null,
                ariaPosInSet: null,
                ariaPressed: null,
                ariaReadOnly: null,
                ariaRelevant: null,
                ariaRequired: null,
                ariaSelected: null,
                ariaSetSize: null,
                ariaSort: null,
                ariaValueMax: null,
                ariaValueMin: null,
                ariaValueNow: null,
                ariaValueText: null,
                ariaColCount: null,
                ariaColIndex: null,
                ariaDetails: null,
                ariaErrorMessage: null,
                ariaKeyShortcuts: null,
                ariaModal: null,
                ariaPlaceholder: null,
                ariaRoleDescription: null,
                ariaRowCount: null,
                ariaRowIndex: null,
                ariaRowSpan: null,
                dir: null,
                draggable: null,
                hidden: null,
                id: null,
                lang: null,
                role: null,
                tabIndex: null,
                title: null,
            });
        });

        it('should provide definition for each individual html prop', () => {
            function foo() {}
            class MyComponent extends Element  {}
            const { props } = target.getComponentDef(MyComponent);
            // aria multi-capital
            expect(props.ariaActiveDescendant).toEqual({
                config: 3,
                type: 'any',
                attr: 'aria-activedescendant',
            });
            expect(props.role).toEqual({
                config: 3,
                type: 'any',
                attr: 'role',
            });
            // aria exception
            expect(props.ariaAutoComplete).toEqual({
                config: 3,
                type: 'any',
                attr: 'aria-autocomplete',
            });
            // explicit mapping
            expect(props.tabIndex).toEqual({
                config: 3,
                type: 'any',
                attr: 'tabindex',
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

            const { props } = target.getComponentDef(MySubComponent);
            expect(props.foo).toEqual({
                config: 1,
                type: 'any',
                attr: 'foo',
            });
            expect(props.xBar).toEqual({
                config: 3,
                type: 'any',
                attr: 'x-bar',
            });
            expect(props.fizz).toEqual({
                config: 0,
                type: 'any',
                attr: 'fizz',
            });
            expect(props.x).toEqual({
                config: 1,
                type: 'any',
                attr: 'x',
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
            expect(target.getComponentDef(MyComponent).props.foo).toEqual({
                config: 0,
                type: 'any',
                attr: 'foo',
            });
        });

        it('should support html properties with exceptional transformation', function() {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                readOnly: {}
            };
            // non-global html property with weird map
            expect(target.getComponentDef(MyComponent).props.readOnly).toEqual({
                config: 0,
                type: 'any',
                attr: 'readonly',
            });
        });
    });
});
