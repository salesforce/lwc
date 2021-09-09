import { createElement, setFeatureFlagForTest } from 'lwc';

import DefaultExtendsNative from 'x/defaultExtendsNative';
import LightContainer from 'x/lightContainer';
import NativeContainer from 'x/nativeContainer';

function isSyntheticShadowRootInstance(sr) {
    return Boolean(sr && /function SyntheticShadowRoot/.test(sr.constructor.toString()));
}

function isNativeShadowRootInstance(sr) {
    return Boolean(sr && !isSyntheticShadowRootInstance(sr));
}

if (!process.env.DISABLE_SYNTHETIC) {
    describe('when root component shadowSupportMode="any"', () => {
        let elm;

        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
            elm = createElement('x-native-container', { is: NativeContainer });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should attach shadow root', () => {
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
            }
        });

        it('should not attach shadow root for child light component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            expect(light.shadowRoot).toBeNull();
        });

        it('should attach shadow root for child synthetic component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic');
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            }
        });

        it('should attach shadow root for child synthetic component with shadowSupportMode="default"', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic-default');
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            }
        });

        it('should attach shadow root for slotted synthetic', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic.slot-assigned');
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            }
        });
    });

    describe('when root component renderMode="light"', () => {
        let elm;

        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
            elm = createElement('x-light-container', { is: LightContainer });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should not attach shadow root', () => {
            expect(elm.shadowRoot).toBeNull();
        });

        it('should attach synthetic shadow root for child synthetic component', () => {
            const synthetic = elm.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root for slotted synthetic component', () => {
            const synthetic = elm.querySelector('x-synthetic.default-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root to child component slotted into native component', () => {
            const synthetic = elm.querySelector('x-synthetic.native-slotted');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });

    describe('when overriding with shadowSupportMode="default"', () => {
        let elm;

        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
            elm = createElement('x-default-extends-native', {
                is: DefaultExtendsNative,
            });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should attach shadow root', () => {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root for descendant synthetic component', () => {
            const light = elm.shadowRoot.querySelector('x-light-container');
            const synthetic = light.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });
}
