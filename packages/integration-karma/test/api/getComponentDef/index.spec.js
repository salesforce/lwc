import { LightningElement, api, getComponentDef } from 'lwc';

import PublicProperties from 'x/publicProperties';
import PublicAccessors from 'x/publicAccessors';
import PublicMethods from 'x/publicMethods';
import PublicPropertiesInheritance from 'x/publicPropertiesInheritance';
import PublicMethodsInheritance from 'x/publicMethodsInheritance';

import WireProperties from 'x/wireProperties';
import WireMethods from 'x/wireMethods';
import WirePropertiesInheritance from 'x/wirePropertiesInheritance';
import WireMethodsInheritance from 'x/wireMethodsInheritance';

import wireAdapter from 'x/wireAdapter';

function testInvalidComponentConstructor(name, ctor) {
    it(`should throw for ${name}`, () => {
        expect(() => getComponentDef(ctor)).toThrowError(
            /Invalid prototype chain for \w+, you must extend LightningElement./,
        );
    });
}

// TODO: #932 - fix because currently throwing `Cannot read property 'name' of null`
// testInvalidComponentConstructor('null', null);
// testInvalidComponentConstructor('undefined', undefined);

testInvalidComponentConstructor('Object', {});
testInvalidComponentConstructor('Class not extending LightningElement', class Component {});

const GLOBAL_HTML_ATTRIBUTES = [
    'accessKey',
    'ariaActiveDescendant',
    'ariaAtomic',
    'ariaAutoComplete',
    'ariaBusy',
    'ariaChecked',
    'ariaColCount',
    'ariaColIndex',
    'ariaColSpan',
    'ariaControls',
    'ariaCurrent',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaDisabled',
    'ariaErrorMessage',
    'ariaExpanded',
    'ariaFlowTo',
    'ariaHasPopup',
    'ariaHidden',
    'ariaInvalid',
    'ariaKeyShortcuts',
    'ariaLabel',
    'ariaLabelledBy',
    'ariaLevel',
    'ariaLive',
    'ariaModal',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaOwns',
    'ariaPlaceholder',
    'ariaPosInSet',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRelevant',
    'ariaRequired',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'ariaSelected',
    'ariaSetSize',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'role',
    'tabIndex',
    'title',
].sort();

it('it should return the global HTML attributes in props', () => {
    class Component extends LightningElement {}
    const def = getComponentDef(Component);

    const defaultProps = Object.keys(def.props).sort();
    expect(defaultProps).toEqual(GLOBAL_HTML_ATTRIBUTES);
});

describe('@api', () => {
    it('should return the public properties in the props object', () => {
        const { props } = getComponentDef(PublicProperties);
        expect(props).toEqual(
            jasmine.objectContaining({
                foo: {
                    config: 0,
                    type: 'any',
                    attr: 'foo',
                },
                bar: {
                    config: 0,
                    type: 'any',
                    attr: 'bar',
                },
            }),
        );
    });

    it('should return the public accessors in the props object', () => {
        const { props } = getComponentDef(PublicAccessors);
        expect(props).toEqual(
            jasmine.objectContaining({
                getterOnly: {
                    config: 1,
                    type: 'any',
                    attr: 'getter-only',
                },
                getterAndSetter: {
                    config: 3,
                    type: 'any',
                    attr: 'getter-and-setter',
                },
            }),
        );
    });

    it('should return the public methods in the methods object', () => {
        const { methods } = getComponentDef(PublicMethods);
        expect(methods).toEqual({
            foo: PublicMethods.prototype.foo,
            bar: PublicMethods.prototype.bar,
        });
    });

    it('should return also the public properties inherited from the base class', () => {
        const { props } = getComponentDef(PublicPropertiesInheritance);
        expect(props).toEqual(
            jasmine.objectContaining({
                parentProp: {
                    config: 0,
                    type: 'any',
                    attr: 'parent-prop',
                },
                childProp: {
                    config: 0,
                    type: 'any',
                    attr: 'child-prop',
                },
                overriddenInChild: {
                    config: 0,
                    type: 'any',
                    attr: 'overridden-in-child',
                },
            }),
        );
    });

    it('should return also the public methods inherited from the base class', () => {
        const { methods } = getComponentDef(PublicMethodsInheritance);
        expect(methods).toEqual({
            parentMethod: Object.getPrototypeOf(PublicMethodsInheritance.prototype).parentMethod,
            overriddenInChild: PublicMethodsInheritance.prototype.overriddenInChild,
            childMethod: PublicMethodsInheritance.prototype.childMethod,
        });
    });
});

describe('@wire', () => {
    it('should return the wired properties in wire object', () => {
        const { wire } = getComponentDef(WireProperties);
        expect(wire).toEqual({
            foo: {
                adapter: wireAdapter,
            },
            bar: {
                adapter: wireAdapter,
                static: {
                    a: true,
                },
                params: {},
            },
            baz: {
                adapter: wireAdapter,
                static: {
                    b: true,
                },
                params: {
                    c: 'foo',
                },
            },
        });
    });

    it('should return the wired methods in the wire object with a method flag', () => {
        const { wire } = getComponentDef(WireMethods);
        expect(wire).toEqual({
            foo: {
                adapter: wireAdapter,
                method: 1,
            },
            bar: {
                adapter: wireAdapter,
                static: {
                    a: true,
                },
                params: {},
                method: 1,
            },
            baz: {
                adapter: wireAdapter,
                static: {
                    b: true,
                },
                params: {
                    c: 'foo',
                },
                method: 1,
            },
        });
    });

    it('should inherit wire properties from the base class', () => {
        const { wire } = getComponentDef(WirePropertiesInheritance);
        expect(wire).toEqual({
            parentProp: {
                adapter: wireAdapter,
                static: {
                    parent: true,
                },
                params: {},
            },
            overriddenInChild: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
            },
            childProp: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
            },
        });
    });

    it('should inherit the wire methods from the case class', () => {
        const { wire } = getComponentDef(WireMethodsInheritance);
        expect(wire).toEqual({
            parentMethod: {
                adapter: wireAdapter,
                static: {
                    parent: true,
                },
                params: {},
                method: 1,
            },
            overriddenInChild: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                method: 1,
            },
            childMethod: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                method: 1,
            },
        });
    });
});

describe('circular dependencies', () => {
    // Emulates an AMD module with circular dependency.
    function circularDependency(klass) {
        const ctor = function() {
            return klass;
        };
        ctor.__circular__ = true;

        return ctor;
    }

    it('should resolve parent class with circular dependencies', () => {
        const Circular = circularDependency(
            class extends LightningElement {
                @api foo;
            },
        );
        class Component extends Circular {
            @api bar;
        }

        const { props } = getComponentDef(Component);
        expect(props).toEqual(
            jasmine.objectContaining({
                foo: {
                    config: 0,
                    type: 'any',
                    attr: 'foo',
                },
                bar: {
                    config: 0,
                    type: 'any',
                    attr: 'bar',
                },
            }),
        );
    });

    it('should throw when parent class is a circular dependency not extending LightningElement', () => {
        const Circular = circularDependency(class {});
        class Component extends Circular {}

        expect(() => getComponentDef(Component)).toThrowError(
            /Invalid prototype chain for Component, you must extend LightningElement./,
        );
    });

    it('should throw when parent class is a circular dependency resolving null', () => {
        const Circular = circularDependency(null);
        class Component extends Circular {}

        expect(() => getComponentDef(Component)).toThrowError(
            /Circular module dependency for Component, must resolve to a constructor that extends LightningElement./,
        );
    });
});
