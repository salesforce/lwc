import { createElement } from 'lwc';

import ConstructorGetElementsByTagName from 'x/constructorGetElementsByTagName';

describe('LightningElement.getElementsByTagName', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-get-elements-by-tag-name', {
                is: ConstructorGetElementsByTagName,
            });
        }).toThrowErrorDev(
            Error,
            /Assert Violation: this.getElementsByTagName\(\) cannot be called during the construction of the custom element for <x-constructor-get-elements-by-tag-name> because no children has been added to this element yet\./
        );
    });
});
