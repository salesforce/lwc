import { createElement } from 'lwc';
import { customElementConnectedErrorListener } from 'test-utils';

import NativeShadowCmp from 'ai/nativeShadow';
import SyntheticShadowCmp from 'ai/syntheticShadow';
import LightDomCmp from 'ai/lightDom';

describe('attachInternals', () => {
    if (process.env.NATIVE_SHADOW) {
        describe('native shadow', () => {
            let elm;
            beforeEach(() => {
                elm = createElement('ai-native-shadow-component', { is: NativeShadowCmp });
                document.body.appendChild(elm);
            });

            afterEach(() => {
                document.body.removeChild(elm);
            });

            it('should be able to create ElementInternals object', () => {
                expect(elm.hasElementInternalsBeenSet()).toBeTruthy();
            });

            it('should not be callable outside a component', () => {
                const cmp = document.querySelector('ai-native-shadow-component');
                expect(cmp.attachInternals).toBeUndefined();
            });

            it('should throw an error when called twice on the same element', () => {
                expect(() => elm.callAttachInternals()).toThrowError(DOMException);
            });
        });
    } else {
        describe('synthetic shadow', () => {
            it('should throw error when used inside a component', () => {
                const elm = createElement('ai-synthetic-shadow-component', {
                    is: SyntheticShadowCmp,
                });
                const error = customElementConnectedErrorListener(() => {
                    document.body.appendChild(elm);
                });

                expect(error).not.toBeUndefined();
                expect(error.message).toBe(
                    'attachInternals API is not supported in light DOM or synthetic shadow.'
                );
            });
        });
    }

    describe('light DOM', () => {
        it('should throw error when used inside a component', () => {
            const elm = createElement('ai-light-dom-component', { is: LightDomCmp });
            const error = customElementConnectedErrorListener(() => {
                document.body.appendChild(elm);
            });

            expect(error).not.toBeUndefined();
            expect(error.message).toBe(
                'attachInternals API is not supported in light DOM or synthetic shadow.'
            );
        });
    });
});
