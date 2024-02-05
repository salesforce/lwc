import { createElement } from 'lwc';
import { isNativeShadowRootInstance, isSyntheticShadowRootInstance } from 'test-utils';

import Any from 'x/any';
import Invalid from 'x/invalid';
import Valid from 'x/valid';
import NativeOnly from 'x/native';

describe('shadowSupportMode static property', () => {
    it('should log error for invalid values', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toLogErrorDev(/Invalid value for static property shadowSupportMode: 'true'/);
    });

    it('should not throw for valid values', () => {
        expect(() => {
            createElement('x-valid', { is: Valid });
        }).not.toThrowError();
    });

    it('should not log error for deprecated value "any"', () => {
        expect(() => {
            createElement('x-any', { is: Any });
        }).not.toLogErrorDev(/Invalid value for static property shadowSupportMode/);
    });

    it('should log warning for deprecated value "any"', () => {
        expect(() => {
            createElement('x-any', { is: Any });
        }).toLogWarningDev(
            /Invalid value 'any' for static property shadowSupportMode\. 'any' is deprecated and will be removed in a future release--use 'native' instead\./
        );
    });
});

describe('ENABLE_NATIVE_SHADOW_MODE', () => {
    it('should be configured as "native" (sanity)', () => {
        expect(NativeOnly.shadowSupportMode === 'native').toBeTrue();
    });

    it('should render native shadow root', () => {
        const elm = createElement('x-native-only', { is: NativeOnly });
        if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
            expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
        } else {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toThrow(
                'Native shadow is not supported on this enviroment'
            );
        }
    });
});
