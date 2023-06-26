import { createElement } from 'lwc';

import Test from 'x/test';

it('should not throw when accessing the property', () => {
    expect(() => {
        createElement('x-test', { is: Test });
    }).not.toThrowError();
});
