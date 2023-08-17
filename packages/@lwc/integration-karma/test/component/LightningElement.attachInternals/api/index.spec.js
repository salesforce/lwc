import { createElement } from 'lwc';
import { customElementConnectedErrorListener } from 'test-utils';

import ShadowDomCmp from 'ai/shadowDom';
import LightDomCmp from 'ai/lightDom';
import BasicCmp from 'ai/basic';

const testConnectedCallbackError = (elm, msg) => {
    const error = customElementConnectedErrorListener(() => {
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

if (typeof ElementInternals !== 'undefined') {
    if (process.env.NATIVE_SHADOW) {
        describe('native shadow', () => {
            let elm;
            beforeEach(() => {
                elm = createTestElement('ai-shadow-component', ShadowDomCmp);
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
        it('should throw error when used inside a component', () => {
            const elm = createElement('ai-light-dom-component', { is: LightDomCmp });
            testConnectedCallbackError(
                elm,
                'attachInternals API is not supported in light DOM or synthetic shadow.'
            );
        });
    });
} else {
    it('should throw an error when used with unsupported browser environments', () => {
        const elm = createElement('ai-unsupported-env-component', { is: ShadowDomCmp });
        testConnectedCallbackError(
            elm,
            'attachInternals API is not supported in this browser environment.'
        );
    });
}

it('should not be callable outside a component', () => {
    const elm = createTestElement('ai-component', BasicCmp);
    if (process.env.NODE_ENV === 'production') {
        expect(elm.attachInternals).toBeUndefined();
    } else {
        expect(() => elm.attachInternals).toLogErrorDev(
            /Error: \[LWC error]: attachInternals cannot be accessed outside of a component\. Use this.attachInternals instead\./
        );
    }
});
