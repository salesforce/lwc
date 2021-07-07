import { createElement, setFeatureFlagForTest } from 'lwc';

import Invalid from 'x/invalid';
import Valid from 'x/valid';

describe('preferNativeShadow flag enabled', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_PREFER_NATIVE_SHADOW', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_PREFER_NATIVE_SHADOW', false);
    });
    it('should throw for invalid values', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toThrowError(/Invalid value for static property preferNativeShadow: 'true'/);
    });

    it('should not throw for valid values', () => {
        expect(() => {
            createElement('x-valid', { is: Valid });
        }).not.toThrowError();
    });
});

describe('preferNativeShadow flag disabled', () => {
    it('should disallow preferNativeShadow by default', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toThrowError(/`preferNativeShadow` is not available in this environment./);
    });
});
