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

const createTestElement = (name, def) => {
    const elm = createElement(name, { is: def });
    document.body.appendChild(elm);
    return elm;
};

const attachInternalsSanityTest = (cmp) => {
    let elm;
    beforeEach(() => {
        elm = createTestElement('ai-component', cmp);
    });

    afterEach(() => {
        document.body.removeChild(elm);
    });

    it('should be able to create ElementInternals object', () => {
        expect(elm.hasElementInternalsBeenSet()).toBeTruthy();
    });

    it('should throw an error when called twice on the same element', () => {
        // The error type is different between browsers
        expect(() => elm.callAttachInternals()).toThrowError();
    });
};

if (typeof ElementInternals !== 'undefined') {
    if (process.env.NATIVE_SHADOW) {
        describe('native shadow', () => {
            attachInternalsSanityTest(ShadowDomCmp);
        });
    } else {
        describe('synthetic shadow', () => {
            it('should throw error when used inside a component', () => {
                const elm = createElement('ai-synthetic-shadow-component', { is: ShadowDomCmp });
                testConnectedCallbackError(
                    elm,
                    'attachInternals API is not supported in light DOM or synthetic shadow.'
                );
            });
        });
    }

    describe('light DOM', () => {
        attachInternalsSanityTest(LightDomCmp);
    });
} else {
    // Because of the order error messages are thrown, this error only appears when synthetic shadow
    // is disabled. Otherwise, 'attachInternals API is not supported in light DOM or synthetic shadow.'
    // is thrown instead.
    if (!process.env.SYNTHETIC_SHADOW_ENABLED) {
        it('should throw an error when used with unsupported browser environments', () => {
            const elm = createElement('ai-unsupported-env-component', { is: ShadowDomCmp });
            testConnectedCallbackError(
                elm,
                'attachInternals API is not supported in this browser environment.'
            );
        });
    }
}

it('should not be callable outside a component', () => {
    const elm = createTestElement('ai-component', BasicCmp);
    if (process.env.NODE_ENV === 'production') {
        expect(elm.attachInternals).toBeUndefined();
    } else {
        expect(() => elm.attachInternals).toLogWarningDev(
            /attachInternals cannot be accessed outside of a component\. Use this.attachInternals instead\./
        );
    }
});
