import { LightningElement, createElement } from '../main';
import { getComponentDef, getComponentConstructor } from '../def';

describe('def', () => {
    describe('#getComponentDef()', () => {
        it('should understand empty constructors', () => {
            const def = class MyComponent extends LightningElement {};
            expect(() => {
                getComponentDef(def);
            }).not.toThrow();
        });

        it('should prevent mutations of important keys but should allow expondos for memoization and polyfills', () => {
            class MyComponent extends LightningElement {}
            const def = getComponentDef(MyComponent);
            expect(() => {
                def.name = 'something else';
            }).toThrow();

            def.expando = 1;
            expect(def.expando).toBe(1);
        });

        it('should throw for stateful components not extending Element', () => {
            const def = class MyComponent {};
            expect(() => getComponentDef(def)).toThrow();
        });

        it('should understand static publicMethods', () => {
            class MyComponent extends LightningElement  {
                foo() {}
                bar() {}
            }
            MyComponent.publicMethods = ['foo', 'bar'];
            expect(Object.keys(getComponentDef(MyComponent).methods)).toEqual(['foo', 'bar']);
        });

        it('should understand static wire', () => {
            class MyComponent extends LightningElement  {}
            MyComponent.wire = { x: { type: 'record' } };
            expect(getComponentDef(MyComponent).wire).toEqual({ x: { type: 'record' } });
        });

        it('should infer config and type from public props without explicitly specifying them', () => {
            function foo() {}
            class MyComponent extends LightningElement  {}
            Object.defineProperties(MyComponent.prototype, {
                foo: { get: foo, configurable: true }
            });
            MyComponent.publicProps = {
                foo: {
                    config: 1
                },
                xBar: {},
            };
            const { props } = getComponentDef(MyComponent);
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
            class MyComponent extends LightningElement  {}
            expect(Object.keys(getComponentDef(MyComponent).props).reduce((reducer, propName) => {
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
                // draggable: null, // this is not supported in jsdom just yet (https://github.com/jsdom/jsdom/issues/2268)
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
            class MyComponent extends LightningElement  {}
            const { props } = getComponentDef(MyComponent);
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
            class MySuperComponent extends LightningElement {}
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

            const { props } = getComponentDef(MySubComponent);
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
            class MyComponent extends LightningElement {}
            Object.defineProperties(MyComponent.prototype, {
                x: { set: x, configurable: true }
            });

            MyComponent.publicProps = {
                x: {
                    config: 1
                }
            };

            expect(() => {
                getComponentDef(MyComponent);
            }).toThrow();
        });

        it('should inherit methods correctly', function() {
            class MyComponent extends LightningElement {
                foo() {}
                bar() {}
            }

            MyComponent.publicMethods = ['foo', 'bar'];

            class MySubComponent extends MyComponent {
                fizz() {}
                buzz() {}
            }

            MySubComponent.publicMethods = ['fizz', 'buzz'];

            expect(Object.keys(getComponentDef(MySubComponent).methods)).toEqual([
                'foo',
                'bar',
                'fizz',
                'buzz'
            ]);
        });

        it('should inherit static wire properly', () => {
            class MyComponent extends LightningElement  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { y: { type: 'record' } };
            expect(getComponentDef(MySubComponent).wire).toEqual({
                x: {
                    type: 'record'
                },
                y: {
                    type: 'record'
                }
            });
        });

        it('should inherit static wire properly when parent defines same property', () => {
            class MyComponent extends LightningElement  {}
            MyComponent.wire = { x: { type: 'record' } };
            class MySubComponent extends MyComponent {}
            MySubComponent.wire = { x: { type: 'subrecord' } };
            expect(getComponentDef(MySubComponent).wire).toEqual({
                x: {
                    type: 'subrecord'
                }
            });
        });

        it('should handle publicProps with empty object', function() {
            class MyComponent extends LightningElement  {}
            MyComponent.publicProps = {
                foo: {}
            };
            expect(getComponentDef(MyComponent).props.foo).toEqual({
                config: 0,
                type: 'any',
                attr: 'foo',
            });
        });

        it('should support html properties with exceptional transformation', function() {
            class MyComponent extends LightningElement  {}
            MyComponent.publicProps = {
                readOnly: {}
            };
            // non-global html property with weird map
            expect(getComponentDef(MyComponent).props.readOnly).toEqual({
                config: 0,
                type: 'any',
                attr: 'readonly',
            });
        });

        it('should not allow null prototype', function() {
            const L = null;
            class MyComponent extends L  {}
            expect(() => {
                getComponentDef(MyComponent);
            }).toThrow();
        });

        it('should not allow null in proto chain', function() {
            const L = null;
            class Foo extends L {}
            class MyComponent extends Foo  {}
            expect(() => {
                getComponentDef(MyComponent);
            }).toThrow();
        });
    });
    describe('#getComponentConstructor()', () => {
        it('should be null when passed something other than an HTMLElement', function() {
            expect(getComponentConstructor({} as any)).toBeNull();
        });

        it('should be null when passed an native HTMLElement with no VM', function() {
            const div = document.createElement('div');
            expect(getComponentConstructor(div)).toBeNull();
        });

        it('should return the constructor when passed an LWC custom element', function() {
            class MyComponent extends LightningElement {}
            const elm = createElement('x-element', { is: MyComponent });
            expect(getComponentConstructor(elm)).toEqual(MyComponent);
        });
    });
    describe('circular references', () => {
        it('should be resolved on for __proto__', () => {
            class A extends LightningElement  {}
            A.publicProps = {
                a: {}
            };

            // circular artifact for A
            function CircularA() {
                return A;
            }
            CircularA.__circular__ = true;

            class B extends CircularA {}
            // make sure it picks the props from A
            expect(getComponentDef(B).props.a).toEqual(getComponentDef(A).props.a);
            // make sure it picks the props from LightingElement
            expect(getComponentDef(B).props.title).toBeDefined();
        });

        it('should allow escape hatch for Locker and other systems to provide their own base class to mimic LightningElement', () => {
            // circular artifact for LightingElement
            function CircularA() {
                return CircularA; // because it returns itself, the engine knows what to do.
            }
            CircularA.__circular__ = true;

            class B extends CircularA {}
            // make sure it picks the props from LightingElement
            expect(getComponentDef(B).props.title).toBeDefined();
        });

        it('should not allow null results', () => {
            function CircularA() {
                return  null;
            }
            CircularA.__circular__ = true;

            class B extends CircularA {}
            // make sure it picks the props from LightingElement
            expect(() => {
                getComponentDef(B);
            }).toThrow();
        });
    });
});
