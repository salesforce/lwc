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
import ObserveNothing from 'x/observeNothing';
import ObserveFoo from 'x/observeFoo';

const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;

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
        it('throws error for unsupported "extends" option', () => {
            expect(() => {
                customElements.define('x-unsupported-extends', class extends HTMLElement {}, {
                    extends: 'button',
                });
            }).toThrowError(
                'NotSupportedError: "extends" key in customElements.define() options is not supported.'
            );
        });

        it('throws error for duplicate tag definition', () => {
            class Foo extends HTMLElement {}

            customElements.define('x-string-defined-twice', Foo);

            expect(() => {
                customElements.define('x-string-defined-twice', Foo);
            }).toThrowError(
                "Failed to execute 'define' on 'CustomElementRegistry': the name \"x-string-defined-twice\" has already been used with this registry"
            );
        });

        it('throws error for duplicate class definition', () => {
            class Foo extends HTMLElement {}

            customElements.define('x-class-defined-twice', Foo);

            expect(() => {
                customElements.define('x-class-defined-twice-2', Foo);
            }).toThrowError(
                "Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry"
            );
        });

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
    });

    describe('LWC elements and custom elements', () => {
        it('calling document.createElement after lwc.createElement', () => {
            const elm1 = createElement('x-nonce8', { is: Nonce8 });
            document.body.appendChild(elm1);
            const elm2 = document.createElement('x-nonce8');
            document.body.appendChild(elm2);
            expect(elm1.expectedTagName).toEqual('x-nonce8');
            // TODO [#2877]: elm2 is not upgraded
            // expect(elm2.expectedTagName).toEqual('x-nonce8')
        });

        it('calling lwc.createElement after document.createElement', () => {
            const elm1 = document.createElement('x-nonce9');
            document.body.appendChild(elm1);
            const elm2 = createElement('x-nonce9', { is: Nonce9 });
            document.body.appendChild(elm2);
            expect(elm2.expectedTagName).toEqual('x-nonce9');
            // TODO [#2877]: elm1 is not upgraded
            // expect(elm1.expectedTagName).toEqual('x-nonce9')
        });
    });

    describe('errors', () => {
        it('throws when new-ing an undefined HTMLElement constructor', () => {
            class MyComponent extends HTMLElement {}
            const callNew = () => {
                new MyComponent();
            };
            expect(callNew).toThrowError(TypeError);
            expect(callNew).toThrowError(/Illegal constructor/);
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
                            `x-will-fail-${Math.round(Math.random() * 100000)}`,
                            NotAConstructor
                        );
                    };
                    expect(define).toThrowError(TypeError);
                    expect(define).toThrowError(/The referenced constructor is not a constructor/);
                });
            });
        });
    });

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
                    expect(observations).toEqual([...expectedPreexistingObservations, firstChange]);
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
    });
}
