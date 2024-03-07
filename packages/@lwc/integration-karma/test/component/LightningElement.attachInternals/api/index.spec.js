import { createElement } from 'lwc';
import { customElementCallbackReactionErrorListener } from 'test-utils';

import ShadowDomCmp from 'ai/shadowDom';
import LightDomCmp from 'ai/lightDom';
import BasicCmp from 'ai/basic';

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
            document.body.removeChild(elm);
        });

        it('should be able to create ElementInternals object', () => {
            expect(elm.hasElementInternalsBeenSet()).toBeTruthy();
        });

        it('should throw an error when called twice on the same element', () => {
            // The error type is different between browsers
            const chrome = 'ElementInternals for the specified element was already attached';
            const safari = 'There is already an existing ElementInternals';
            const firefox = 'AttachInternals() has already been called';
            expect(() => elm.callAttachInternals()).toThrowError(
                new RegExp(`(${chrome}|${safari}|${firefox})`)
            );
        });
    });
};

if (typeof ElementInternals !== 'undefined') {
    if (process.env.NATIVE_SHADOW) {
        describe('native shadow', () => {
            attachInternalsSanityTest('native-shadow', ShadowDomCmp);
        });
    } else {
        describe('synthetic shadow', () => {
            it('should throw error when used inside a component', () => {
                const elm = createElement('synthetic-shadow', { is: ShadowDomCmp });
                testConnectedCallbackError(
                    elm,
                    'attachInternals API is not supported in synthetic shadow.'
                );
            });
        });
    }

    describe('light DOM', () => {
        attachInternalsSanityTest('light-dom', LightDomCmp);
    });
} else {
    // Because of the order error messages are thrown, this error only appears when synthetic shadow
    // is disabled. Otherwise, 'attachInternals API is not supported in synthetic shadow.'
    // is thrown instead.
    if (!process.env.SYNTHETIC_SHADOW_ENABLED) {
        it('should throw an error when used with unsupported browser environments', () => {
            createElementsThroughLwcAndCustomElementConstructor(
                'unsupported-env-component',
                ShadowDomCmp
            ).forEach((elm) => {
                testConnectedCallbackError(
                    elm,
                    'attachInternals API is not supported in this browser environment.'
                );
            });
        });
    }
}

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
