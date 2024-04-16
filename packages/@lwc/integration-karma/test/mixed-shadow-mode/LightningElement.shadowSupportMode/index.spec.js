import { createElement } from 'lwc';
import {
    isNativeShadowRootInstance,
    isSyntheticShadowRootInstance,
    IS_SYNTHETIC_SHADOW_LOADED,
} from 'test-utils';

import Any from 'x/any';
import Any2 from 'x/any2';
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
        }).not.toLogErrorDev();
    });

    // TODO [#3971]: Completely remove shadowSupportMode "any"
    it('should warn for deprecated value "any"', () => {
        expect(() => {
            createElement('x-any', { is: Any });
        }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);

        if (IS_SYNTHETIC_SHADOW_LOADED && !process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST) {
            let elm;
            expect(() => {
                elm = createElement('x-any2', { is: Any2 });
            }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toBe(true);
        }
    });
});

describe('ENABLE_NATIVE_SHADOW_MODE', () => {
    it('should be configured as "native" (sanity)', () => {
        expect(NativeOnly.shadowSupportMode === 'native').toBeTrue();
    });

    it('should render native shadow root', () => {
        const elm = createElement('x-native-only', { is: NativeOnly });
        expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
    });
});
