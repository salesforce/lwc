import { createElement } from 'lwc';
import { isNativeShadowRootInstance, isSyntheticShadowRootInstance } from 'test-utils';

import ResetExtendsAny from 'x/resetExtendsAny';
import LightContainer from 'x/lightContainer';
import NativeContainer from 'x/nativeContainer';

function assertNativeShadowRootWhenPossible(elm) {
    if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
        expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
    } else {
        expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
    }
}

if (!process.env.NATIVE_SHADOW) {
    describe('when root component shadowSupportMode="native"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('x-native-container', { is: NativeContainer });
            document.body.appendChild(elm);
        });

        it('should attach a native shadow root when possible', () => {
            assertNativeShadowRootWhenPossible(elm);
        });

        it('should not attach shadow root for child light component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            expect(light.shadowRoot).toBeNull();
        });

        it('should attach a native shadow root when possible for child synthetic component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic');
            assertNativeShadowRootWhenPossible(synthetic);
        });

        it('should attach a native shadow root when possible for child synthetic component with shadowSupportMode="reset"', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic-reset');
            assertNativeShadowRootWhenPossible(synthetic);
        });

        it('should attach a native shadow root when possible for slotted synthetic', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic.slot-slotted');
            assertNativeShadowRootWhenPossible(synthetic);
        });
    });

    describe('when root component renderMode="light"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('x-light-container', { is: LightContainer });
            document.body.appendChild(elm);
        });

        it('should not attach shadow root', () => {
            expect(elm.shadowRoot).toBeNull();
        });

        it('should attach a synthetic shadow root for child synthetic component', () => {
            const synthetic = elm.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a synthetic shadow root for slotted synthetic component', () => {
            const synthetic = elm.querySelector('x-synthetic.slot-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach a synthetic shadow root to child component slotted into native component', () => {
            const synthetic = elm.querySelector('x-synthetic.native-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });

    describe('when overriding with shadowSupportMode="reset"', () => {
        let elm;

        beforeEach(() => {
            elm = createElement('x-reset-extends-any', {
                is: ResetExtendsAny,
            });
            document.body.appendChild(elm);
        });

        it('should attach a synthetic shadow root', () => {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root for descendant synthetic component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });
}
