import { createElement } from 'lwc';
import Nonce1 from 'x/nonce1';
import Nonce2 from 'x/nonce2';
import Nonce3 from 'x/nonce3';
import Nonce4 from 'x/nonce4';
import Nonce5 from 'x/nonce5';
import Nonce6 from 'x/nonce6';
import Nonce7 from 'x/nonce7';
import Nonce8 from 'x/nonce8';
import Nonce9 from 'x/nonce9';
import Nonce10 from 'x/nonce10';
import Nonce11 from 'x/nonce11';
import Nonce12 from 'x/nonce12';
import Nonce13 from 'x/nonce13';
import Nonce14 from 'x/nonce14';
import Nonce15 from 'x/nonce15';
import Nonce16 from 'x/nonce16';
import Nonce17 from 'x/nonce17';
import Nonce18 from 'x/nonce18';
import ObserveNothing from 'x/observeNothing';
import ObserveFoo from 'x/observeFoo';
import ObserveNothingThrow from 'x/observeNothingThrow';
import Component from 'x/component';

const invalidTagNameError = /(not a valid custom element name|must contain a hyphen)/;

const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;

const alreadyDefinedError =
    /(has already been used with this registry|has already been defined as a custom element|Cannot define multiple custom elements with the same tag name)/;
const sameConstructorError =
    /(has already been used with this registry|have the same constructor|Cannot define multiple custom elements with the same class)/;
const notAConstructorError =
    /(not of type 'Function'|not an object|The referenced constructor is not a constructor|is not callable|must be an object|must be a constructor)/;
const undefinedElementError = /(Illegal constructor|does not define a custom element)/;

if (SUPPORTS_CUSTOM_ELEMENTS) {
    describe('customElements.get and customElements.whenDefined', () => {
        // Nonce elements should be defined only once in the entire Karma test suite
        const nonceElements = [
            { tag: 'x-nonce1', Component: Nonce1 },
            { tag: 'x-nonce2', Component: Nonce2 },
        ];

        // There are two ways that customElements.define can eventually get called:
        // 1) createElement
        // 2) explicit customElements.define
        const creators = [
            {
                method: 'using createElement',
                create: (tag, Component) => {
                    return createElement(tag, { is: Component });
                },
            },
            {
                method: 'using CustomElementConstructor',
                create: (tag, Component) => {
                    customElements.define(tag, Component.CustomElementConstructor);
                    return document.createElement(tag);
                },
            },
        ];

        creators.forEach(({ method, create }, i) => {
            const { tag, Component } = nonceElements[i];

            // For LWC components, the PivotCtor is exposed externally but not the UserCtor
            it(method, () => {
                expect(customElements.get(tag)).toBeUndefined();
                const promise = customElements.whenDefined(tag);
                expect(customElements.get(tag)).toBeUndefined();
                const elm = create(tag, Component);
                const Ctor = customElements.get(tag);
                expect(typeof Ctor).toEqual('function');
                document.body.appendChild(elm);
                expect(elm.expectedTagName).toEqual(tag);
                return promise
                    .then((Ctor) => {
                        expect(typeof Ctor).toEqual('function');
                        return customElements.whenDefined(tag);
                    })
                    .then((Ctor) => {
                        expect(typeof Ctor).toEqual('function');
                    });
            });
        });
    });

    describe('patched registry', () => {
        if (window.lwcRuntimeFlags.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
            it('throws error for unsupported "extends" option', () => {
                expect(() => {
                    customElements.define('x-unsupported-extends', class extends HTMLElement {}, {
                        extends: 'button',
                    });
                }).toThrowError(
                    'NotSupportedError: "extends" key in customElements.define() options is not supported.'
                );
            });
        }

        it('throws error for duplicate tag definition', () => {
            class Foo extends HTMLElement {}

            customElements.define('x-string-defined-twice', Foo);

            expect(() => {
                customElements.define('x-string-defined-twice', Foo);
            }).toThrowError(alreadyDefinedError);
        });

        it('throws error for duplicate class definition', () => {
            class Foo extends HTMLElement {}

            customElements.define('x-class-defined-twice', Foo);

            expect(() => {
                customElements.define('x-class-defined-twice-2', Foo);
            }).toThrowError(sameConstructorError);
        });

        if (window.lwcRuntimeFlags.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
            it('allows non-LWC custom element to use the same tag name as LWC custom elements', () => {
                const elm = createElement('x-nonce3', { is: Nonce3 });
                document.body.appendChild(elm);
                expect(elm.tagName.toLowerCase()).toEqual('x-nonce3');
                expect(elm.expectedTagName).toEqual('x-nonce3');

                class Foo extends HTMLElement {}

                customElements.define('x-nonce3', Foo);
                const elm2 = new Foo();
                document.body.appendChild(elm2);
                expect(elm2.tagName.toLowerCase()).toEqual('x-nonce3');
            });
        }

        it('allows two LWC custom elements to use the same tag name', () => {
            const elm1 = createElement('x-nonce4', { is: Nonce4 });
            document.body.appendChild(elm1);
            expect(elm1.tagName.toLowerCase()).toEqual('x-nonce4');
            expect(elm1.expectedTagName).toEqual('x-nonce4');

            // deliberately causing a collision
            const elm2 = createElement('x-nonce4', { is: Nonce5 });
            document.body.appendChild(elm2);
            expect(elm2.tagName.toLowerCase()).toEqual('x-nonce4');
            expect(elm2.expectedTagName).toEqual('x-nonce5');
        });

        it('get() should always return the same constructor', () => {
            createElement('x-nonce10', { is: Nonce10 });
            const firstCtor = customElements.get('x-nonce10');
            expect(firstCtor).not.toBeUndefined();
            createElement('x-nonce10', { is: Nonce11 });
            const secondCtor = customElements.get('x-nonce10');
            expect(secondCtor).not.toBeUndefined();
            expect(secondCtor).toBe(firstCtor);
        });

        it('whenDefined() should always return the same constructor - defined before whenDefined', () => {
            createElement('x-nonce6', { is: Nonce6 });
            let firstCtor;
            return customElements
                .whenDefined('x-nonce6')
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    firstCtor = Ctor;
                    createElement('x-nonce6', { is: Nonce7 });
                    return customElements.whenDefined('x-nonce6');
                })
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    expect(Ctor).toBe(firstCtor);
                });
        });

        it('whenDefined() should always return the same constructor - defined after whenDefined', () => {
            const promise = customElements.whenDefined('x-nonce12');
            createElement('x-nonce12', { is: Nonce12 });
            let firstCtor;
            return promise
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    firstCtor = Ctor;
                    const promise = customElements.whenDefined('x-nonce12');
                    createElement('x-nonce12', { is: Nonce13 });
                    return promise;
                })
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    expect(Ctor).toBe(firstCtor);
                });
        });

        describe('defining an invalid tag name', () => {
            const scenarios = [
                {
                    name: 'LWC component',
                    define: (tagName) => {
                        createElement(tagName, { is: Component });
                    },
                },
                {
                    name: 'Vanilla component',
                    define: (tagName) => {
                        customElements.define(tagName, class extends HTMLElement {});
                    },
                },
            ];

            scenarios.forEach(({ name, define }, i) => {
                describe(name, () => {
                    it('throws error', () => {
                        expect(() => {
                            define(`invalid${i}`);
                        }).toThrowError(invalidTagNameError);
                    });

                    it('throws same error twice in a row', () => {
                        expect(() => {
                            define(`alsoinvalid${i}`);
                        }).toThrowError(invalidTagNameError);

                        expect(() => {
                            define(`alsoinvalid${i}`);
                        }).toThrowError(invalidTagNameError);
                    });
                });
            });
        });
    });

    describe('constructor', () => {
        it('new-ing an LWC component constructor from customElements.get()', () => {
            createElement('x-nonce14', { is: Nonce14 });
            const Ctor = customElements.get('x-nonce14');
            const elm = new Ctor();
            document.body.appendChild(elm);

            // TODO [#2984]: element is not upgraded
            expect(elm.shadowRoot).toBeNull();
            expect(elm.expectedTagName).toBeUndefined();
            // expect(elm.shadowRoot).not.toBeNull()
            // expect(elm.expectedTagName).toEqual('x-nonce14')
        });

        it('new-ing an LWC component via new CustomElementConstructor()', () => {
            customElements.define('x-nonce15', Nonce15.CustomElementConstructor);

            const elm = new Nonce15.CustomElementConstructor();
            document.body.appendChild(elm);
            expect(elm.expectedTagName).toEqual('x-nonce15');
        });

        it('new-ing an LWC component defined with CustomElementConstructor, constructor from customElements.get()', () => {
            customElements.define('x-nonce16', Nonce16.CustomElementConstructor);

            const Ctor = customElements.get('x-nonce16');

            const elm = new Ctor();
            document.body.appendChild(elm);
            expect(elm.expectedTagName).toEqual('x-nonce16');
        });
    });

    describe('LWC elements and custom elements', () => {
        it('calling document.createElement after lwc.createElement', () => {
            const elm1 = createElement('x-nonce8', { is: Nonce8 });
            document.body.appendChild(elm1);
            const elm2 = document.createElement('x-nonce8');
            document.body.appendChild(elm2);
            expect(elm1.expectedTagName).toEqual('x-nonce8');

            // TODO [#2984]: elm2 is not upgraded
            expect(elm2.shadowRoot).toBeNull();
            expect(elm2.expectedTagName).toBeUndefined();
            // expect(elm2.shadowRoot).not.toBeNull()
            // expect(elm2.expectedTagName).toEqual('x-nonce8')
        });

        it('calling lwc.createElement after document.createElement', () => {
            const elm1 = document.createElement('x-nonce9');
            document.body.appendChild(elm1);
            const elm2 = createElement('x-nonce9', { is: Nonce9 });
            document.body.appendChild(elm2);
            expect(elm2.expectedTagName).toEqual('x-nonce9');

            // TODO [#2984]: elm1 is not upgraded
            expect(elm1.shadowRoot).toBeNull();
            expect(elm1.expectedTagName).toBeUndefined();
            // expect(elm1.shadowRoot).not.toBeNull()
            // expect(elm1.expectedTagName).toEqual('x-nonce9')
        });

        if (window.lwcRuntimeFlags.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
            it('pre-existing custom element, LWC defined first', () => {
                const tagName = 'x-preexisting-in-dom';
                const vanilla = document.createElement(tagName);
                document.body.appendChild(vanilla);
                const lwcElm = createElement(tagName, { is: Component });
                document.body.appendChild(lwcElm);

                customElements.define(
                    tagName,
                    class extends HTMLElement {
                        constructor() {
                            super();
                            this.notLWC = true;
                        }
                    }
                );

                expect(vanilla.notLWC).toEqual(true);
            });

            it('does not allow passing arbitrary UserCtors into the PivotCtor', () => {
                const tagName = 'x-nonce-17';
                document.body.appendChild(createElement(tagName, { is: Nonce17 }));
                const Ctor = document.createElement(tagName).constructor;

                class MyUserCtor extends HTMLElement {
                    isMyUserCtor = true;
                }

                expect(() => {
                    new Ctor(MyUserCtor);
                }).toThrowError(
                    /Failed to create custom element: the provided constructor is unregistered: MyUserCtor\./
                );
            });

            it('does not allow passing non-functions into the PivotCtor', () => {
                const tagName = 'x-nonce-18';
                document.body.appendChild(createElement(tagName, { is: Nonce18 }));
                const Ctor = document.createElement(tagName).constructor;
                expect(() => {
                    new Ctor(null);
                }).toThrowError(
                    /Failed to create custom element: the provided constructor is not a constructor\./
                );
            });
        }
    });

    describe('errors', () => {
        it('throws when new-ing an undefined HTMLElement constructor', () => {
            class MyComponent extends HTMLElement {}
            const callNew = () => {
                new MyComponent();
            };
            expect(callNew).toThrowError(TypeError);
            expect(callNew).toThrowError(undefinedElementError);
        });

        describe('throws when defining an invalid constructor', () => {
            const invalidConstructors = [
                {
                    name: 'null',
                    getConstructor: () => null,
                },
                {
                    name: 'null proto',
                    getConstructor: () => Object.create(null),
                },
                {
                    name: 'bad proto',
                    getConstructor: () => {
                        const result = function () {};
                        result.prototype = 2;
                        return result;
                    },
                },
            ];

            invalidConstructors.forEach(({ name, getConstructor }) => {
                it(name, () => {
                    const define = () => {
                        const NotAConstructor = getConstructor();
                        customElements.define(
                            `x-will-fail-${Math.round(Math.random() * 1000000)}`,
                            NotAConstructor
                        );
                    };
                    expect(define).toThrowError(TypeError);
                    expect(define).toThrowError(notAConstructorError);
                });
            });
        });
    });

    describe('observedAttributes', () => {
        it('custom element with observedAttributes but no attributeChangedCallback', () => {
            customElements.define(
                'x-no-attr-change-cb',
                class extends HTMLElement {
                    static observedAttributes = ['foo'];
                }
            );

            const elm = document.createElement('x-no-attr-change-cb');
            document.body.appendChild(elm);

            // Basically we just want to make sure nothing throws
            elm.setAttribute('foo', 'bar');
            elm.removeAttribute('foo');
            expect(elm.getAttribute('foo')).toBeNull();
        });
    });

    // These tests only make sense for scoped custom elements, because we create two elements with the same tag name
    if (window.lwcRuntimeFlags.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY) {
        describe('Observed attributes on vanilla component with same tag as LWC component', () => {
            let observations;

            beforeEach(() => {
                observations = [];
            });

            function createVanillaElement(tagName) {
                class Observed extends HTMLElement {
                    static observedAttributes = ['foo'];

                    attributeChangedCallback(name, oldValue, newValue) {
                        observations.push({ name, oldValue, newValue });
                    }
                }

                customElements.define(tagName, Observed);

                const observed = new Observed();
                document.body.appendChild(observed);
                return observed;
            }

            function createVanillaElementWithSuper(tagName) {
                class Observed extends HTMLElement {
                    static observedAttributes = ['foo'];

                    attributeChangedCallback(name, oldValue, newValue) {
                        observations.push({ name, oldValue, newValue });
                    }
                }

                customElements.define(tagName, Observed);

                const observed = new Observed();
                document.body.appendChild(observed);
                return observed;
            }

            function createVanillaElementUpgradedWithNoPreexistingAttrs(tagName) {
                const elm = document.createElement(tagName);
                document.body.appendChild(elm);

                class Observed extends HTMLElement {
                    static observedAttributes = ['foo'];

                    attributeChangedCallback(name, oldValue, newValue) {
                        observations.push({ name, oldValue, newValue });
                    }
                }

                customElements.define(tagName, Observed);

                return elm;
            }

            function createVanillaElementUpgradedWithPreexistingAttr(tagName) {
                const elm = document.createElement(tagName);
                elm.setAttribute('foo', 'preexisting');
                document.body.appendChild(elm);

                class Observed extends HTMLElement {
                    static observedAttributes = ['foo'];

                    attributeChangedCallback(name, oldValue, newValue) {
                        observations.push({ name, oldValue, newValue });
                    }
                }

                customElements.define(tagName, Observed);

                return elm;
            }

            const scenarios = [
                {
                    name: 'Basic',
                    tagName: 'x-observed-attr',
                    createVanillaElement: createVanillaElement,
                    LwcComponent: ObserveNothing,
                },
                {
                    name: 'attributeChangedCallback on super',
                    tagName: 'x-observed-attr-super',
                    createVanillaElement: createVanillaElementWithSuper,
                    LwcComponent: ObserveNothing,
                },
                {
                    name: 'same observed attributes on both LWC and vanilla components',
                    tagName: 'x-observed-attr-same',
                    createVanillaElement: createVanillaElement,
                    LwcComponent: ObserveFoo,
                },
                {
                    name: 'Upgrade',
                    tagName: 'x-observed-attr-upgrade',
                    createVanillaElement: createVanillaElementUpgradedWithNoPreexistingAttrs,
                    LwcComponent: ObserveNothing,
                },
                {
                    name: 'Upgrade with preexisting attribute',
                    tagName: 'x-observed-attr-upgrade-preexisting',
                    createVanillaElement: createVanillaElementUpgradedWithPreexistingAttr,
                    LwcComponent: ObserveNothing,
                    expectedPreexistingObservations: [
                        {
                            name: 'foo',
                            oldValue: null,
                            newValue: 'preexisting',
                        },
                    ],
                },
            ];

            scenarios.forEach(
                ({
                    name,
                    tagName,
                    createVanillaElement,
                    LwcComponent,
                    expectedPreexistingObservations = [],
                }) => {
                    // Register an LWC component, then a vanilla one that has observed attributes.
                    // It should still work with pivots.
                    it(name, () => {
                        const elm1 = createElement(tagName, { is: LwcComponent });
                        document.body.appendChild(elm1);
                        const elm2 = createVanillaElement(tagName);
                        document.body.appendChild(elm2);
                        const initialValue = elm2.getAttribute('foo');
                        // set an attr
                        elm2.setAttribute('foo', 'bar');
                        const firstChange = {
                            name: 'foo',
                            oldValue: initialValue,
                            newValue: 'bar',
                        };
                        expect(observations).toEqual([
                            ...expectedPreexistingObservations,
                            firstChange,
                        ]);
                        // remove an attr
                        elm2.removeAttribute('foo');
                        const secondChange = {
                            name: 'foo',
                            oldValue: 'bar',
                            newValue: null,
                        };
                        expect(observations).toEqual([
                            ...expectedPreexistingObservations,
                            firstChange,
                            secondChange,
                        ]);
                        // set and remove an attr that is not observed
                        elm2.setAttribute('unobserved', 'true');
                        elm2.removeAttribute('unobserved');
                        expect(observations).toEqual([
                            ...expectedPreexistingObservations,
                            firstChange,
                            secondChange,
                        ]);
                    });
                }
            );

            it('custom element with attributeChangedCallback but no observedAttributes', () => {
                // The LWC component observes foo, but the vanilla component doesn't,
                // so its attributeChangedCallback should never fire
                const elm1 = createElement('x-no-observed-attrs', { is: ObserveFoo });
                document.body.appendChild(elm1);
                const observations = [];

                class Custom extends HTMLElement {
                    attributeChangedCallback(name, oldValue, newValue) {
                        observations.push({ name, oldValue, newValue });
                    }
                }

                customElements.define('x-no-observed-attrs', Custom);
                const elm2 = new Custom();
                document.body.appendChild(elm2);

                elm2.setAttribute('foo', 'bar');
                elm2.removeAttribute('foo');
                expect(elm2.getAttribute('foo')).toBeNull();
                expect(observations).toEqual([]);
            });

            it('LWC element with attributeChangedCallback but no observedAttributes', () => {
                // The LWC component observes nothing, but the vanilla component observes foo.
                // Changing the foo attribute on the LWC component should not fire attributeChangedCallback.
                class Custom extends HTMLElement {
                    static observedAttributes = ['foo'];

                    attributeChangedCallback() {
                        throw new Error('should not be invoked');
                    }
                }

                customElements.define('x-no-observed-attrs-2', Custom);

                const lwcElm = createElement('x-no-observed-attrs-2', {
                    is: ObserveNothingThrow,
                });
                document.body.appendChild(lwcElm);

                lwcElm.setAttribute('foo', 'bar');
                lwcElm.removeAttribute('foo');
                expect(lwcElm.getAttribute('foo')).toBeNull();
            });

            describe('attributeChangedCallback timing', () => {
                let originalOnError;
                let errors;

                const onError = (e) => {
                    e.preventDefault(); // avoids logging the error to the console
                    errors.push(e);
                };

                beforeEach(() => {
                    errors = [];

                    // Nulling out window.onerror disables Jasmine's global error handler, so we can listen for errors
                    // ourselves. There doesn't seem to be a better way to disable Jasmine's behavior here.
                    // https://github.com/jasmine/jasmine/pull/1860
                    originalOnError = window.onerror;
                    window.onerror = null;
                    window.addEventListener('error', onError);
                });

                afterEach(() => {
                    window.onerror = originalOnError;
                    window.removeEventListener('error', onError);
                });

                ['native', 'pivot'].forEach((behavior) => {
                    it(`Element that observes attribute and throws in attributeChangedCallback - ${behavior}`, () => {
                        const tagName = `x-observes-and-throws-${behavior}`;

                        if (behavior === 'pivot') {
                            // Registering an LWC component with the same tag name triggers the pivot behavior
                            // for the native element
                            createElement(tagName, { is: ObserveNothing });
                        }

                        class Custom extends HTMLElement {
                            static observedAttributes = ['foo'];

                            attributeChangedCallback() {
                                throw new Error('Error in attributeChangedCallback!');
                            }
                        }

                        customElements.define(tagName, Custom);

                        const elm = document.createElement(tagName);
                        document.body.appendChild(elm);

                        // None of these should throw synchronously, because this matches native browser behavior.
                        // Details: https://github.com/salesforce/lwc/pull/2724#discussion_r899066735
                        elm.setAttribute('foo', 'bar');
                        elm.removeAttribute('foo');

                        return new Promise((resolve) => setTimeout(resolve)).then(() => {
                            expect(errors.length).toEqual(2);
                            for (const { message } of errors) {
                                expect(message).toContain('Error in attributeChangedCallback!');
                            }
                        });
                    });
                });
            });
        });
    }
}
