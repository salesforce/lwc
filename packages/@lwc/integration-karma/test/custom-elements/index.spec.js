import { createElement } from 'lwc';
import Nonce1 from 'x/nonce1';
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
import Nonce19 from 'x/nonce19';
import Component from 'x/component';

const invalidTagNameError = /(not a valid custom element name|must contain a hyphen)/;

const alreadyDefinedError =
    /(has already been used with this registry|has already been defined as a custom element|Cannot define multiple custom elements with the same tag name)/;
const sameConstructorError =
    /(has already been used with this registry|have the same constructor|Cannot define multiple custom elements with the same class)/;
const notAConstructorError =
    /(not of type 'Function'|not an object|The referenced constructor is not a constructor|is not callable|must be an object|must be a constructor)/;
const undefinedElementError = /(Illegal constructor|does not define a custom element)/;

describe('customElements.get and customElements.whenDefined', () => {
    it('using CustomElementConstructor', () => {
        // Nonce elements should be defined only once in the entire Karma test suite
        const tagName = 'x-nonce1';
        expect(customElements.get(tagName)).toBeUndefined();
        const promise = customElements.whenDefined(tagName);
        expect(customElements.get(tagName)).toBeUndefined();
        customElements.define(tagName, Nonce1.CustomElementConstructor);
        const elm = document.createElement(tagName);
        const Ctor = customElements.get(tagName);
        expect(Ctor).toBe(Nonce1.CustomElementConstructor);
        document.body.appendChild(elm);
        expect(elm.expectedTagName).toEqual(tagName);
        return promise
            .then((Ctor) => {
                expect(Ctor).toBe(Nonce1.CustomElementConstructor);
                return customElements.whenDefined(tagName);
            })
            .then((Ctor) => {
                expect(Ctor).toBe(Nonce1.CustomElementConstructor);
            });
    });
});

describe('patched registry', () => {
    it('elements have the same constructor as defined in the registry', () => {
        const tagName = 'x-same-ctor-as-in-registry';
        class Component extends HTMLElement {}
        customElements.define(tagName, Component);

        const elm = document.createElement(tagName);
        expect(elm instanceof Component).toEqual(true);
        expect(elm.constructor).toBe(Component);
    });

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

    describe('same constructor returned from get/whenDefined', () => {
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
                    // Create an lwc with same tag but different constructor, this will register a pivot for the same tag
                    createElement('x-nonce6', { is: Nonce7 });
                    return customElements.whenDefined('x-nonce6');
                })
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    expect(Ctor).toBe(firstCtor);
                });
        });

        it('whenDefined() should always return the same constructor - defined after whenDefined', () => {
            // Check `cE.whenDefined()` called _before_ `cE.define()`
            const promise = customElements.whenDefined('x-nonce12');
            createElement('x-nonce12', { is: Nonce12 });
            let firstCtor;
            return promise
                .then((Ctor) => {
                    expect(Ctor).not.toBeUndefined();
                    firstCtor = Ctor;
                    // Check `cE.whenDefined()` called _after_ `cE.define()`
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

    it('vanilla element should be an instance of the right class', () => {
        const tagName = 'x-check-ctor-instanceof';
        class MyElement extends HTMLElement {}

        const whenDefinedPromiseBeforeDefine = customElements.whenDefined(tagName);

        customElements.define(tagName, MyElement);
        const elm = document.createElement(tagName);

        // check element prototype
        expect(elm instanceof MyElement).toEqual(true);
        expect(elm.constructor).toBe(MyElement);

        // check cE.get()
        const Ctor = customElements.get(tagName);
        expect(Ctor).toBe(MyElement);

        // check cE.whenDefined() when the promise is created _before_ cE.define()
        return whenDefinedPromiseBeforeDefine
            .then((Ctor) => {
                expect(Ctor).toBe(MyElement);
                // check cE.whenDefined() when the promise is created _after_ cE.define()
                return customElements.whenDefined(tagName);
            })
            .then((Ctor) => {
                expect(Ctor).toBe(MyElement);
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
    it('new-ing an LWC component constructor directly', () => {
        createElement('x-nonce14', { is: Nonce14 });
        const Ctor = document.createElement('x-nonce14').constructor; // hack to get the pivot constructor
        const elm = new Ctor();
        document.body.appendChild(elm);

        // TODO [#2970]: element is not upgraded
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

        // TODO [#2970]: elm2 is not upgraded
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

        // TODO [#2970]: elm1 is not upgraded
        expect(elm1.shadowRoot).toBeNull();
        expect(elm1.expectedTagName).toBeUndefined();
        // expect(elm1.shadowRoot).not.toBeNull()
        // expect(elm1.expectedTagName).toEqual('x-nonce9')
    });

    it('calling new Ctor() with a sneaky custom upgradeCallback', () => {
        const elm1 = createElement('x-nonce19', { is: Nonce19 });
        document.body.appendChild(elm1);
        // Sneakily get the constructor in a way that is hard for LWC to block
        const Ctor = document.createElement('x-nonce19').constructor;
        let upgradeCalled = false;
        // Sneakily pass in our own custom upgradeCallback
        const upgradeCallback = () => {
            upgradeCalled = true;
        };

        document.body.appendChild(new Ctor(upgradeCallback));
        expect(upgradeCalled).toEqual(false);
    });
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

// See https://web.dev/more-capable-form-controls/#feature-detection
const supportsFACE =
    'FormDataEvent' in window &&
    'ElementInternals' in window &&
    'setFormValue' in window.ElementInternals.prototype;

if (supportsFACE) {
    describe('form-associated custom element (FACE) lifecycle callbacks', () => {
        function testFormAssociated(shouldBeFormAssociated, tagName, Ctor) {
            const calls = [];

            Ctor.prototype.formAssociatedCallback = function (form) {
                calls.push({
                    name: 'formAssociatedCallback',
                    elm: this,
                    form: form,
                });
            };

            Ctor.prototype.formDisabledCallback = function (disabled) {
                calls.push({
                    name: 'formDisabledCallback',
                    elm: this,
                    disabled,
                });
            };

            Ctor.prototype.formResetCallback = function () {
                calls.push({
                    name: 'formResetCallback',
                    elm: this,
                });
            };

            Ctor.prototype.formStateRestoreCallback = function (state, mode) {
                calls.push({
                    name: 'formStateRestoreCallback',
                    elm: this,
                    state,
                    mode,
                });
            };

            customElements.define(tagName, Ctor);

            const form = document.createElement('form');
            const fieldset = document.createElement('fieldset');
            const elm = document.createElement(tagName);
            form.appendChild(fieldset);
            fieldset.appendChild(elm);
            document.body.appendChild(form);

            // formAssociatedCallback should be called with the form
            expect(calls.length).toEqual(shouldBeFormAssociated ? 1 : 0);
            expect(calls[0]).toEqual(
                shouldBeFormAssociated ? { name: 'formAssociatedCallback', elm, form } : undefined
            );

            // check formDisabledCallback
            fieldset.disabled = true;
            expect(calls.length).toEqual(shouldBeFormAssociated ? 2 : 0);
            expect(calls[1]).toEqual(
                shouldBeFormAssociated
                    ? { name: 'formDisabledCallback', elm, disabled: true }
                    : undefined
            );

            // check formResetCallback
            form.reset();
            expect(calls.length).toEqual(shouldBeFormAssociated ? 3 : 0);
            expect(calls[2]).toEqual(
                shouldBeFormAssociated ? { name: 'formResetCallback', elm } : undefined
            );

            // formStateRestoreCallback cannot be manually invoked, just call it ourselves
            elm.formStateRestoreCallback('foo', 'bar');
            expect(calls.length).toEqual(shouldBeFormAssociated ? 4 : 1);
            expect(calls.at(-1)).toEqual({
                name: 'formStateRestoreCallback',
                elm,
                state: 'foo',
                mode: 'bar',
            });
        }

        it('supports FACE callbacks', () => {
            testFormAssociated(
                true,
                'x-face-callbacks',
                class extends HTMLElement {
                    static formAssociated = true;
                }
            );
        });

        it('does not call FACE callbacks if not form-associated', () => {
            testFormAssociated(
                false,
                'x-face-callbacks-not-form-associated',
                class extends HTMLElement {
                    static formAssociated = false;
                }
            );
        });
    });
}

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
