/* eslint-disable @typescript-eslint/no-unused-vars */
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
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    });
}

beforeAll(function() {
    const getNormalizedFunctionAsString = fn => fn.toString().replace(/(\s|\n)/g, '');

    jasmine.addMatchers({
        toEqualWireSettings: function() {
            return {
                compare: function(actual, expected) {
                    Object.keys(actual).forEach(currentKey => {
                        const normalizedActual = Object.assign({}, actual[currentKey], {
                            config: getNormalizedFunctionAsString(actual[currentKey].config),
                        });

                        const normalizedExpected = Object.assign({}, expected[currentKey], {
                            config: getNormalizedFunctionAsString(
                                expected[currentKey].config || function() {}
                            ),
                        });

                        expect(normalizedActual).toEqual(normalizedExpected);
                    });

                    return {
                        pass: true,
                    };
                },
            };
        },
    });
});

testInvalidComponentConstructor('null', null);
testInvalidComponentConstructor('undefined', undefined);
testInvalidComponentConstructor('String', 'component');
testInvalidComponentConstructor('Object', {});
testInvalidComponentConstructor('Function', function() {});
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
            })
        );
    });

    it('should return the public accessors in the props object', () => {
        const { props } = getComponentDef(PublicAccessors);
        expect(props).toEqual(
            jasmine.objectContaining({
                getterOnly: {
                    config: 0,
                    type: 'any',
                    attr: 'getter-only',
                },
                getterAndSetter: {
                    config: 0,
                    type: 'any',
                    attr: 'getter-and-setter',
                },
            })
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
            })
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

/**
 * Skipping the tests for the definitions of the wire when calling getComponentDef
 * because that's implementation details of the component, and should not be exposed,
 * ideally no one is using that information since it is not accessible from outside
 * the component.
 */
describe('@wire', () => {
    xit('should return the wired properties in wire object', () => {
        const { wire } = getComponentDef(WireProperties);
        expect(wire).toEqualWireSettings({
            foo: {
                adapter: wireAdapter,
                config: function($cmp) {
                    return {};
                },
            },
            bar: {
                adapter: wireAdapter,
                static: {
                    a: true,
                },
                params: {},
                config: function($cmp) {
                    return { a: true };
                },
            },
            baz: {
                adapter: wireAdapter,
                static: {
                    b: true,
                },
                params: {
                    c: 'foo',
                },
                config: function($cmp) {
                    return { b: true, c: $cmp.foo };
                },
            },
        });
    });

    xit('should return the wired methods in the wire object with a method flag', () => {
        const { wire } = getComponentDef(WireMethods);
        expect(wire).toEqualWireSettings({
            foo: {
                adapter: wireAdapter,
                method: 1,
                config: function($cmp) {
                    return {};
                },
            },
            bar: {
                adapter: wireAdapter,
                static: {
                    a: true,
                },
                params: {},
                method: 1,
                config: function($cmp) {
                    return { a: true };
                },
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
                config: function($cmp) {
                    return { b: true, c: $cmp.foo };
                },
            },
        });
    });

    xit('should inherit wire properties from the base class', () => {
        const { wire } = getComponentDef(WirePropertiesInheritance);
        expect(wire).toEqualWireSettings({
            parentProp: {
                adapter: wireAdapter,
                static: {
                    parent: true,
                },
                params: {},
                config: function($cmp) {
                    return { parent: true };
                },
            },
            overriddenInChild: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                config: function($cmp) {
                    return { child: true };
                },
            },
            childProp: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                config: function($cmp) {
                    return { child: true };
                },
            },
        });
    });

    xit('should inherit the wire methods from the case class', () => {
        const { wire } = getComponentDef(WireMethodsInheritance);
        expect(wire).toEqualWireSettings({
            parentMethod: {
                adapter: wireAdapter,
                static: {
                    parent: true,
                },
                params: {},
                method: 1,
                config: function($cmp) {
                    return {
                        parent: true,
                    };
                },
            },
            overriddenInChild: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                method: 1,
                config: function($cmp) {
                    return {
                        child: true,
                    };
                },
            },
            childMethod: {
                adapter: wireAdapter,
                static: {
                    child: true,
                },
                params: {},
                method: 1,
                config: function($cmp) {
                    return {
                        child: true,
                    };
                },
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
            }
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
            })
        );
    });

    it('should throw when parent class is a circular dependency not extending LightningElement', () => {
        const Circular = circularDependency(class {});
        class Component extends Circular {}

        expect(() => getComponentDef(Component)).toThrowError(
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    });

    it('should throw when parent class is a circular dependency resolving null', () => {
        const Circular = circularDependency(null);
        class Component extends Circular {}

        expect(() => getComponentDef(Component)).toThrowError(
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    });

    describe('locker integration', () => {
        it('should resolve parent class with circular dependency that resoves to itself', () => {
            function SecureBaseClass() {
                return SecureBaseClass;
            }
            SecureBaseClass.__circular__ = true;
            class Component extends SecureBaseClass {
                @api bar;
            }
            const { props } = getComponentDef(Component);
            expect(props).toEqual(
                jasmine.objectContaining({
                    bar: {
                        config: 0,
                        type: 'any',
                        attr: 'bar',
                    },
                })
            );
        });
    });
});
