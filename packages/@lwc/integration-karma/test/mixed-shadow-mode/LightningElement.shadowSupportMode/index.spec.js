import { createElement, setFeatureFlagForTest } from 'lwc';
import { isNativeShadowRootInstance, isSyntheticShadowRootInstance } from 'test-utils';

import Invalid from 'x/invalid';
import Valid from 'x/valid';

describe('shadowSupportMode static property', () => {
    it('should throw for invalid values', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toThrowErrorDev(/Invalid value for static property shadowSupportMode: 'true'/);
    });

    it('should not throw for valid values', () => {
        expect(() => {
            createElement('x-valid', { is: Valid });
        }).not.toThrowError();
    });
});

describe('ENABLE_MIXED_SHADOW_MODE', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
    });

    it('should be configured as "any" (sanity)', () => {
        expect(Valid.shadowSupportMode === 'any').toBeTrue();
    });

    it('should enable mixed shadow mode', () => {
        const elm = createElement('x-valid', { is: Valid });
        if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
            expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
        } else {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
        }
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
    });
});
