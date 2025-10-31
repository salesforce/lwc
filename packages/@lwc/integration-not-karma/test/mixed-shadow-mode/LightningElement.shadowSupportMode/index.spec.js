import { createElement } from 'lwc';

import Any from 'c/any';
import Any2 from 'c/any2';
import Invalid from 'c/invalid';
import Valid from 'c/valid';
import NativeOnly from 'c/native';
import { IS_SYNTHETIC_SHADOW_LOADED } from '../../../helpers/constants.js';
import {
    isNativeShadowRootInstance,
    isSyntheticShadowRootInstance,
} from '../../../helpers/utils.js';

describe('shadowSupportMode static property', () => {
    it('should log error for invalid values', () => {
        expect(() => {
            createElement('c-invalid', { is: Invalid });
        }).toLogErrorDev(/Invalid value for static property shadowSupportMode: 'true'/);
    });

    it('should not throw for valid values', () => {
        expect(() => {
            createElement('c-valid', { is: Valid });
        }).not.toLogErrorDev();
    });

    // TODO [#3971]: Completely remove shadowSupportMode "any"
    it('should warn for deprecated value "any"', () => {
        expect(() => {
            createElement('c-any', { is: Any });
        }).toLogWarningDev(/Invalid value 'any' for static property shadowSupportMode/);

        if (IS_SYNTHETIC_SHADOW_LOADED && !process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST) {
            let elm;
            expect(() => {
                elm = createElement('c-any2', { is: Any2 });
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
        const elm = createElement('c-native-only', { is: NativeOnly });
        expect(isNativeShadowRootInstance(elm.shadowRoot)).toBeTrue();
    });
});
