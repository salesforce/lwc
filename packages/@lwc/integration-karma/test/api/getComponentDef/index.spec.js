/* eslint-disable @typescript-eslint/no-unused-vars */
import { LightningElement, api, getComponentDef, createElement } from 'lwc';
import { ariaProperties } from 'test-utils';

import PublicProperties from 'x/publicProperties';
import PublicAccessors from 'x/publicAccessors';
import PublicMethods from 'x/publicMethods';
import PublicPropertiesInheritance from 'x/publicPropertiesInheritance';
import PublicMethodsInheritance from 'x/publicMethodsInheritance';
import PrivateAccessors from 'x/privateAccessors';
import HtmlElementProps from 'x/htmlElementProps';

function testInvalidComponentConstructor(name, ctor) {
    it(`should throw for ${name}`, () => {
        expect(() => getComponentDef(ctor)).toThrowError(
            /.+ is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    });
}

beforeAll(function () {
    const getNormalizedFunctionAsString = (fn) => fn.toString().replace(/(\s|\n)/g, '');

    jasmine.addMatchers({
        toEqualWireSettings: function () {
            return {
                compare: function (actual, expected) {
                    Object.keys(actual).forEach((currentKey) => {
                        const normalizedActual = Object.assign({}, actual[currentKey], {
                            config: getNormalizedFunctionAsString(actual[currentKey].config),
                        });

                        const normalizedExpected = Object.assign({}, expected[currentKey], {
                            config: getNormalizedFunctionAsString(
                                expected[currentKey].config || function () {}
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
testInvalidComponentConstructor('Function', function () {});
testInvalidComponentConstructor('Class not extending LightningElement', class Component {});

const GLOBAL_HTML_ATTRIBUTES = [
    'accessKey',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'spellcheck',
    'tabIndex',
    'title',
    ...ariaProperties,
].sort();

const message = (propName) =>
    `Error: [LWC warn]: The property "${propName}" is not publicly accessible. Add the @api annotation to the property declaration or getter/setter in the component to make it accessible.`;

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
                    config: 1,
                    type: 'any',
                    attr: 'getter-only',
                },
                getterAndSetter: {
                    config: 3,
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
                    config: 3,
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

    it('should log warning when accessing a private prop', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['privateProp'];
        }).toLogWarningDev(message('privateProp'));
    });

    it('should log warning when setting a private prop', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['privateProp'] = 'foo';
        }).toLogWarningDev(message('privateProp'));
    });

    it('should not log warning when accessing a public prop', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['publicProb'];
        }).not.toLogWarningDev();
    });

    it('should not log warning when setting a public prop', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['publicProb'] = 'foo';
        }).not.toLogWarningDev();
    });

    it('should log warning when accessing a private prop without a getter', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['nonDecoratedPrivateProp'];
        }).toLogWarningDev(message('nonDecoratedPrivateProp'));
    });

    it('should log warning when accessing a tracked private prop', () => {
        const elm = createElement('x-private-accessor', { is: PrivateAccessors });
        document.body.appendChild(elm);

        expect(() => {
            elm['trackedProp'];
        }).toLogWarningDev(message('trackedProp'));
    });

    it('should not log a warning on HTMLElement props', () => {
        const elm = createElement('x-html-element-props', { is: HtmlElementProps });
        document.body.appendChild(elm);

        expect(() => {
            elm.constructor;
            elm.tabIndex;
            elm.title;
            elm.attributes;
        }).not.toLogWarningDev();

        expect(elm.attributes.length).toBe(0);
    });
});

describe('circular dependencies', () => {
    // Emulates an AMD module with circular dependency.
    function circularDependency(klass) {
        const ctor = function () {
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
