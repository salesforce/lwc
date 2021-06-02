import { createElement } from 'lwc';

import Invalid from 'x/invalid';
import Valid from 'x/valid';

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
