import { createElement, LightningElement, api } from 'lwc';
import { getPropertyDescriptor } from 'test-utils';

import GetterSetterAndProp from 'x/getterSetterAndProp';
import Properties from 'x/properties';
import Mutate from 'x/mutate';
import GetterSetter from 'x/getterSetter';
import ConstructorGetterAccess from 'x/constructorGetterAccess';
import Reactivity from 'x/reactivity';
import Methods from 'x/methods';
import Inheritance from 'x/inheritance';
import NullInitialValue from 'x/nullInitialValue';
import ExtendsMixin from 'x/extendsMixin';

import duplicatePropertyTemplate from 'x/duplicatePropertyTemplate';
import NoSetter from 'x/noSetter';

describe('properties', () => {
    it('should expose class properties with the api decorator', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(elm.publicProp).toBeDefined();
        expect(() => {
            expect(elm.privateProp).toBeUndefined();
        }).toLogWarningDev(/Add the @api annotation to the property declaration/);
    });

    it('should make the public property reactive if used in the template', () => {
        const elm = createElement('x-reactive', { is: Reactivity });
        document.body.appendChild(elm);

        expect(elm.getRenderCount()).toBe(1);

        elm.reactive = 'reactive';
        return Promise.resolve().then(() => {
            expect(elm.getRenderCount()).toBe(2);
        });
    });

    it('should make the public property not reactive if not used in the template', () => {
        const elm = createElement('x-reactive', { is: Reactivity });
        document.body.appendChild(elm);

        expect(elm.getRenderCount()).toBe(1);

        elm.nonReactive = 'reactive';
        return Promise.resolve().then(() => {
            expect(elm.getRenderCount()).toBe(1);
        });
    });

    it('throws an error when attempting set a property of a public property', () => {
        const elm = createElement('x-mutate', { is: Mutate });
        elm.publicProp = { x: 0 };
        document.body.appendChild(elm);

        expect(() => {
            elm.mutateCmp((cmp) => {
                cmp.publicProp.x = 1;
            });
        }).toThrowError();
    });
});

describe('getter/setter', () => {
    it('should expose public getters and setters', () => {
        const elm = createElement('x-getter-setter', { is: GetterSetter });

        elm.publicAccessor = 'test';
        expect(elm.publicAccessor).toBe('test:setter:getter');
    });

    it('should allow calling the getter and setter during construction', () => {
        expect(() => {
            createElement('x-constructor-getter-access', { is: ConstructorGetterAccess });
        }).not.toThrow();
    });
});

describe('methods', () => {
    it('should only expose methods with the api decorator', () => {
        const elm = createElement('x-methods', { is: Methods });

        expect(elm.publicMethod).toBeDefined();
        expect(() => {
            expect(elm.privateMethod).toBeUndefined();
        }).toLogWarningDev(/Add the @api annotation to the property declaration/);
    });

    it('should invoke the method with the right this value and arguments', () => {
        const param = {};
        const elm = createElement('x-methods', { is: Methods });

        const { thisValue, args } = elm.publicMethod(param);
        expect(thisValue instanceof Methods).toBe(true);
        expect(args).toEqual([param]);
    });
});

describe('inheritance', () => {
    const cases = [
        {
            type: 'normal',
            Component: Inheritance,
        },
        {
            type: 'mixin',
            Component: ExtendsMixin,
        },
    ];
    cases.forEach(({ type, Component }) => {
        describe(type, () => {
            it('should inherit the public props from the base class', () => {
                const elm = createElement('x-inheritance', { is: Component });

                expect(elm.base).toBe('base');
                expect(elm.child).toBe('child');
                expect(elm.overridden).toBe('overridden - child');
            });

            it('should inherit the public methods from the base class', () => {
                const elm = createElement('x-inheritance', { is: Component });

                expect(elm.baseMethod()).toBe('base');
                expect(elm.childMethod()).toBe('child');
                expect(elm.overriddenMethod()).toBe('overridden - child');
            });
        });
    });
});

it('should not log an error when initializing api value to null', () => {
    const elm = createElement('x-foo-init-api', { is: NullInitialValue });

    expect(() => document.body.appendChild(elm)).not.toLogErrorDev();
});

describe('restrictions', () => {
    it('logs a property error when a public field conflicts with a method', () => {
        expect(() => {
            // The following class is wrapped by the compiler with registerDecorators. We check
            // here if the fields are validated properly.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @api showFeatures;
                // eslint-disable-next-line no-dupe-class-members
                showFeatures() {}
            }
        }).toLogErrorDev(
            /Invalid @api showFeatures field\. Found a duplicate method with the same name\./
        );
    });

    it('logs an error when an @api field has a setter but no getter', () => {
        expect(() => {
            expect(() => {
                // The following class is wrapped by the compiler with registerDecorators. We check here
                // if the fields are validated properly.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                class Invalid extends LightningElement {
                    @api
                    set foo(val) {
                        this._foo = val;
                    }
                }
            }).toThrowError(
                /Invalid public accessor foo decorated with @api\. The property is missing a getter\./
            );
        }).toLogErrorDev(
            /Missing getter for property foo decorated with @api in (class|function) Invalid/
        );
    });

    it('does not throw or log an error when an @api field has a getter but no setter', () => {
        expect(() => {
            // The following class is wrapped by the compiler with registerDecorators. We check here
            // if the fields are validated properly.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @api
                get foo() {
                    return this._foo;
                }
            }
        }).not.toLogError(); // if it throws an error, that will also fail this test
    });
});

describe('non-LightningElement `this` when calling accessor', () => {
    let elm;

    beforeEach(() => {
        elm = createElement('x-getter-setter-and-prop', { is: GetterSetterAndProp });
        document.body.appendChild(elm);
    });

    const expectedErrorMessage =
        /(undefined has no properties|undefined is not an object|Right side of assignment cannot be destructured|vm is undefined|undefined is not a VM|Cannot destructure property '(getHook|setHook)'|Cannot read properties of undefined)/;

    const scenarios = [
        { type: 'getterSetter', prop: 'getterSetterProp' },
        { type: 'classProp', prop: 'classProp' },
    ];

    scenarios.forEach(({ type, prop }) => {
        describe(type, () => {
            it('getter - external', () => {
                const { get } = getPropertyDescriptor(elm, prop);
                expect(() => {
                    get.call({});
                }).toThrowError(TypeError, expectedErrorMessage);
            });

            it('setter - external', () => {
                const { set } = getPropertyDescriptor(elm, prop);
                expect(() => {
                    set.call({}, 'foo');
                }).toThrowError(TypeError, expectedErrorMessage);
            });

            it('getter - internal', () => {
                const callback = () => {
                    elm.callGetterInternallyWithWrongThis(prop);
                };
                // TODO [#3245]: this should not differ between prod mode and dev mode, class property and getter/setter
                if (type === 'classProp') {
                    expect(callback).toThrowError(TypeError, expectedErrorMessage);
                } else {
                    expect(callback).toThrowErrorDev(TypeError, expectedErrorMessage);
                }
            });

            it('setter - internal', () => {
                const callback = () => {
                    elm.callSetterInternallyWithWrongThis(prop, 'foo');
                };
                // TODO [#3245]: this should not differ between prod mode and dev mode, class property and getter/setter
                if (type === 'classProp') {
                    expect(callback).toThrowError(TypeError, expectedErrorMessage);
                } else {
                    expect(callback).toThrowErrorDev(TypeError, expectedErrorMessage);
                }
            });
        });
    });
});

describe('regression [W-9927596]', () => {
    describe('public property with duplicate observed field', () => {
        it('log errors when evaluated and preserve the public property', () => {
            let Ctor;

            expect(() => {
                class DuplicateProperty extends LightningElement {
                    foo = 'observed';
                    // eslint-disable-next-line no-dupe-class-members
                    @api foo = 'public';

                    render() {
                        return duplicatePropertyTemplate;
                    }
                }

                Ctor = DuplicateProperty;
            }).toLogErrorDev(
                /Invalid observed foo field\. Found a duplicate accessor with the same name\./
            );

            const elm = createElement('x-duplicate-property', { is: Ctor });
            document.body.appendChild(elm);

            expect(elm.shadowRoot.querySelector('p').textContent).toBe('public');

            elm.foo = 'updated';
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.querySelector('p').textContent).toBe('updated');
            });
        });
    });

    describe('public property with duplicate accessor', () => {
        it('log errors when evaluated and treat accessors as public', () => {
            let Ctor;
            const accessors = [];

            expect(() => {
                class DuplicateProperty extends LightningElement {
                    @api foo = 'default';

                    // eslint-disable-next-line no-dupe-class-members
                    get foo() {
                        accessors.push('getter');
                        return this._foo;
                    }
                    // eslint-disable-next-line no-dupe-class-members
                    set foo(value) {
                        accessors.push(`setter ${value}`);
                        this._foo = value;
                    }

                    render() {
                        return duplicatePropertyTemplate;
                    }
                }

                Ctor = DuplicateProperty;
            }).toLogErrorDev(
                /Invalid @api foo field\. Found a duplicate accessor with the same name\./
            );

            const elm = createElement('x-duplicate-property', { is: Ctor });
            elm.foo = 'test';

            document.body.appendChild(elm);

            expect(accessors).toEqual(['setter default', 'setter test', 'getter']);
            expect(elm.shadowRoot.querySelector('p').textContent).toBe('test');
        });
    });

    describe('public accessor with duplicate observed field', () => {
        describe('@api on the getter', () => {
            it('log errors when evaluated and preserve the public accessors', () => {
                let Ctor;
                const accessors = [];

                expect(() => {
                    class DuplicateAccessor extends LightningElement {
                        foo = 'default';

                        // eslint-disable-next-line no-dupe-class-members
                        @api
                        get foo() {
                            accessors.push('getter');
                            return this._foo;
                        }
                        // eslint-disable-next-line no-dupe-class-members
                        set foo(value) {
                            accessors.push(`setter ${value}`);
                            this._foo = value;
                        }

                        render() {
                            return duplicatePropertyTemplate;
                        }
                    }

                    Ctor = DuplicateAccessor;
                }).toLogErrorDev(
                    /Invalid observed foo field\. Found a duplicate accessor with the same name\./
                );

                const elm = createElement('x-duplicate-accessor', { is: Ctor });
                elm.foo = 'test';

                document.body.appendChild(elm);

                expect(accessors).toEqual(['setter default', 'setter test', 'getter']);
                expect(elm.shadowRoot.querySelector('p').textContent).toBe('test');
            });
        });

        describe('@api on the setter', () => {
            it('log errors when evaluated and invokes accessors', () => {
                let Ctor;
                const accessors = [];

                expect(() => {
                    class DuplicateAccessor extends LightningElement {
                        foo = 'default';

                        // eslint-disable-next-line no-dupe-class-members
                        @api
                        set foo(value) {
                            accessors.push(`setter ${value}`);
                            this._foo = value;
                        }
                        // eslint-disable-next-line no-dupe-class-members
                        get foo() {
                            accessors.push('getter');
                            return this._foo;
                        }

                        render() {
                            return duplicatePropertyTemplate;
                        }
                    }

                    Ctor = DuplicateAccessor;
                }).toLogErrorDev(
                    /Invalid observed foo field\. Found a duplicate accessor with the same name\./
                );

                const elm = createElement('x-duplicate-accessor', { is: Ctor });
                elm.foo = 'test';

                document.body.appendChild(elm);

                expect(accessors).toEqual(['setter default', 'setter test', 'getter']);
                expect(elm.shadowRoot.querySelector('p').textContent).toBe('test');
            });
        });
    });

    it('logs an error when attempting to set property when there is no setter', () => {
        const elm = createElement('x-no-setter', { is: NoSetter });

        document.body.appendChild(elm);

        expect(() => {
            elm.foo = 'foo';
        }).toLogErrorDev(
            /Invalid attempt to set a new value for property "foo" that does not has a setter decorated with @api/
        );
    });
});
