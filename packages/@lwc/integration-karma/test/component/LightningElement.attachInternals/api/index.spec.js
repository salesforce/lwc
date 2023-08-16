import { createElement } from 'lwc';
import { customElementConnectedErrorListener } from 'test-utils';

import ShadowDomCmp from 'ai/shadowDom';
import LightDomCmp from 'ai/lightDom';

const testConnectedCallbackError = (elm, msg) => {
    const error = customElementConnectedErrorListener(() => {
        document.body.appendChild(elm);
    });
    expect(error).not.toBeUndefined();
    expect(error.message).toEqual(msg);
};

describe('attachInternals', () => {
    if (process.env.NATIVE_SHADOW) {
        let elm;
        beforeEach(() => {
            elm = createElement('ai-native-shadow-component', { is: ShadowDomCmp });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            document.body.removeChild(elm);
        });

        if (process.env.ELEMENT_INTERNALS_DEFINED) {
            describe('native shadow', () => {
                it('should be able to create ElementInternals object', () => {
                    expect(elm.hasElementInternalsBeenSet()).toBeTruthy();
                });

                it('should not be callable outside a component', () => {
                    const cmp = document.querySelector('ai-native-shadow-component');
                    if (process.env.NODE_ENV === 'production') {
                        expect(cmp.attachInternals).toBeUndefined();
                    } else {
                        expect(() => cmp.attachInternals).toLogErrorDev(
                            /Error: \[LWC error]: attachInternals cannot be accessed outside of a component\./
                        );
                    }
                });

                it('should throw an error when called twice on the same element', () => {
                    // The error type is different between browsers
                    expect(() => elm.callAttachInternals()).toThrowError();
                });
            });
        } else {
            describe('unsupported browser environment', () => {
                it('should throw an error when used with unsupported browser environments', () => {
                    testConnectedCallbackError(
                        elm,
                        'attachInternals API is not supported in this browser environment.'
                    );
                });
            });
        }
    } else {
        describe('synthetic shadow', () => {
            it('should throw error when used inside a component', () => {
                const elm = createElement('ai-synthetic-shadow-component', {
                    is: ShadowDomCmp,
                });
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
});
