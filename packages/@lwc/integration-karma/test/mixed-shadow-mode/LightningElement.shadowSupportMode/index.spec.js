import { createElement } from 'lwc';
import { isNativeShadowRootInstance, isSyntheticShadowRootInstance } from 'test-utils';

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
        // eslint-disable-next-line jest/valid-expect
        expect(() => {
            createElement('x-any', { is: Any });
        }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);

        if (process.env.SYNTHETIC_SHADOW_ENABLED && !process.env.MIXED_SHADOW) {
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
        if (process.env.NATIVE_SHADOW_ROOT_DEFINED) {
            expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
        } else {
            expect(isSyntheticShadowRootInstance(elm.shadowRoot)).toThrow(
                'Native shadow is not supported on this enviroment'
            );
        }
    });
});
