import { createElement } from 'lwc';

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
