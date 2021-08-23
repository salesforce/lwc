import { createElement, setFeatureFlagForTest } from 'lwc';

import Invalid from 'x/invalid';
import Valid from 'x/valid';

describe('shadowSupportMode flag enabled', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_MIXED_SHADOW_MODE', false);
    });

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

describe('shadowSupportMode flag disabled', () => {
    it('should disallow shadowSupportMode by default', () => {
        expect(() => {
            createElement('x-invalid', { is: Invalid });
        }).toThrowError(
            /The shadowSupportMode static property is not available in this environment./
        );
    });
});
