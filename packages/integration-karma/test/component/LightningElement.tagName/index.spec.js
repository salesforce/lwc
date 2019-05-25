import { createElement } from 'lwc';

import Test from 'x/test';

it('should throw when accessing the property', () => {
    expect(() => {
        createElement('x-test', { is: Test });
    }).toThrowErrorDev(
        Error,
        'Usage of property `tagName` is disallowed because the component itself does not know which tagName will be used to create the element, therefore writing code that check for that value is error prone.'
    );
});
