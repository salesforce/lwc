import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

it('should throw when accessing the property', () => {
    class Test extends LightningElement {
        constructor() {
            super()
            this.tagName;
        }
    }

    expect(() => {
        createElement('x-test', { is: Test })
    }).toThrowError(
        Error,
        'Usage of property `tagName` is disallowed because the component itself does not know which tagName will be used to create the element, therefore writing code that check for that value is error prone\.'
    )
});
