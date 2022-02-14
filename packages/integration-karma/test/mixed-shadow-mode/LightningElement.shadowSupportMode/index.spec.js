import { createElement, setFeatureFlagForTest } from 'lwc';
import { isSyntheticShadowRootInstance } from 'test-utils';

import Invalid from 'x/invalid';
import Valid from 'x/valid';

describe('shadowSupportMode static property', () => {
    it('should throw for invalid values', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toThrowError(/Invalid value for static property shadowSupportMode: 'true'/);
    });

    it('should not throw for valid values', () => {
        expect(() => {
            createElement('x-valid', { is: Valid });
        }).not.toThrowError();
    });
});

if (!process.env.NATIVE_SHADOW) {
    describe('DISABLE_MIXED_SHADOW_MODE', () => {
        beforeEach(() => {
            setFeatureFlagForTest('DISABLE_MIXED_SHADOW_MODE', true);
        });

        it('should disable mixed shadow mode', () => {
            const elm = createElement('x-valid', { is: Valid });
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBeTrue();
            expect(Valid.shadowSupportMode === 'any').toBeTrue();
        });

        afterEach(() => {
            setFeatureFlagForTest('DISABLE_MIXED_SHADOW_MODE', false);
        });
    });
}
