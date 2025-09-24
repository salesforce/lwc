import { createElement } from 'lwc';

import ShadowDomCmp from 'ai/shadowDom';
import LightDomCmp from 'ai/lightDom';
import BasicCmp from 'ai/basic';
import {
    ENABLE_ELEMENT_INTERNALS_AND_FACE,
    IS_SYNTHETIC_SHADOW_LOADED,
} from '../../../../helpers/constants.js';
import { customElementCallbackReactionErrorListener } from '../../../../helpers/utils.js';

const testConnectedCallbackError = (elm, msg) => {
    const error = customElementCallbackReactionErrorListener(() => {
        document.body.appendChild(elm);
    });
    expect(error).not.toBeUndefined();
    expect(error.message).toBe(msg);
};

const createElementsThroughLwcAndCustomElementConstructor = (tagName, ctor) => [
    createElement(`ai-${tagName}`, { is: ctor }),
    createCustomElementUsingCec(`cec-ai-${tagName}`, ctor.CustomElementConstructor),
];

const createCustomElementUsingCec = (tagName, ctor) => {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, ctor);
    }
    return document.createElement(tagName);
};

const attachInternalsSanityTest = (tagName, ctor) => {
    createElementsThroughLwcAndCustomElementConstructor(
        `${tagName}-element-internal-enabled`,
        ctor
    ).forEach((elm) => {
        beforeAll(() => {
            document.body.appendChild(elm);
        });

        afterAll(() => {
            elm.remove();
        });

        it('should be able to create ElementInternals object', () => {
            expect(elm.hasElementInternalsBeenSet()).toBeTruthy();
        });

        it('should throw an error when called twice on the same element', () => {
            // The error type is different between browsers
            const chrome = 'ElementInternals for the specified element was already attached';
            const safari = 'There is already an existing ElementInternals';
            const firefox = 'AttachInternals\\(\\) has already been called';
            expect(() => elm.callAttachInternals()).toThrowError(
                new RegExp(`(${chrome}|${safari}|${firefox})`)
            );
        });
    });
};

describe.runIf(ENABLE_ELEMENT_INTERNALS_AND_FACE)('ElementInternals', () => {
    // ElementInternals API is supported in the browser
    const elementInternalsSupported = typeof ElementInternals !== 'undefined';
    describe.runIf(elementInternalsSupported)('supported in browser', () => {
        describe.runIf(process.env.NATIVE_SHADOW)('native shadow', () => {
            attachInternalsSanityTest('native-shadow', ShadowDomCmp);
        });

        describe.skipIf(process.env.NATIVE_SHADOW)('synthetic shadow', () => {
            it('should throw error when used inside a component', () => {
                const elm = createElement('synthetic-shadow', { is: ShadowDomCmp });
                testConnectedCallbackError(
                    elm,
                    'attachInternals API is not supported in synthetic shadow.'
                );
            });
        });

        describe('light DOM', () => {
            attachInternalsSanityTest('light-dom', LightDomCmp);
        });
    });

    // ElementInternals API is not supported in the browser
    // Because of the order error messages are thrown, this error only appears when synthetic shadow
    // is disabled. Otherwise, 'attachInternals API is not supported in synthetic shadow.'
    // is thrown instead.
    it.runIf(!elementInternalsSupported && !IS_SYNTHETIC_SHADOW_LOADED)(
        'should throw an error when used with unsupported browser environments',
        () => {
            createElementsThroughLwcAndCustomElementConstructor(
                'unsupported-env-component',
                ShadowDomCmp
            ).forEach((elm) => {
                testConnectedCallbackError(
                    elm,
                    'attachInternals API is not supported in this browser environment.'
                );
            });
        }
    );
});

it.skipIf(ENABLE_ELEMENT_INTERNALS_AND_FACE)(`should throw an error when api version < 61`, () => {
    const elm = createElement('unsupported-api-version-component', { is: ShadowDomCmp });
    // Note CustomElementConstructor is not upgraded by LWC and inherits directly from HTMLElement which means it calls the native
    // attachInternals API.
    expect(() => document.body.appendChild(elm)).toThrowCallbackReactionError(
        /The attachInternals API is only supported in API version 61 and above/
    );
});

it('should not be callable outside a component', () => {
    createElementsThroughLwcAndCustomElementConstructor('element-internal', BasicCmp).forEach(
        (elm) => {
            if (process.env.NODE_ENV === 'production') {
                expect(elm.attachInternals).toBeUndefined();
            } else {
                expect(() => expect(elm.attachInternals).toBeUndefined()).toLogWarningDev(
                    /attachInternals cannot be accessed outside of a component\. Use this.attachInternals instead\./
                );
            }
        }
    );
});
