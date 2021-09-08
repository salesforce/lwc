import { createElement, setFeatureFlagForTest } from 'lwc';

import DefaultNativeLightSynthetic from 'x/defaultNativeLightSynthetic';
import LightSynthetic from 'x/lightSynthetic';
import NativeLightSynthetic from 'x/nativeLightSynthetic';

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
            elm = createElement('x-native-light-synthetic', { is: NativeLightSynthetic });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should attach shadow root (native component)', () => {
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
            }
        });

        it('should not attach shadow root (light composed within native)', () => {
            const light = elm.shadowRoot.querySelector('x-light-synthetic');
            expect(light.shadowRoot).toBeNull();
        });

        it('should attach shadow root (synthetic composed within light composed within native)', () => {
            const light = elm.shadowRoot.querySelector('x-light-synthetic');
            const synthetic = light.querySelector('x-synthetic');
            if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
                expect(isNativeShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            } else {
                expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
            }
        });

        it('should attach shadow root (synthetic assigned to light slot composed within native)', () => {
            const light = elm.shadowRoot.querySelector('x-light-synthetic');
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
            elm = createElement('x-light-synthetic', { is: LightSynthetic });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should not attach any shadow root (root component)', () => {
            expect(elm.shadowRoot).toBeNull();
        });

        it('should attach shadow root (syntheic composed within light)', () => {
            const synthetic = elm.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });

    describe('when overriding with shadowSupportMode="default"', () => {
        let elm;

        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
            elm = createElement('x-default-native-light-synthetic', {
                is: DefaultNativeLightSynthetic,
            });
            document.body.appendChild(elm);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });

        it('should attach shadow root (shadowSupportMode override)', () => {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        });

        it('should attach synthetic shadow root (synthetic composed within light composed within override)', () => {
            const light = elm.shadowRoot.querySelector('x-light-synthetic');
            const synthetic = light.querySelector('x-synthetic');
            expect(isSyntheticShadowRootInstance(synthetic.shadowRoot)).toBeTrue();
        });
    });
}
