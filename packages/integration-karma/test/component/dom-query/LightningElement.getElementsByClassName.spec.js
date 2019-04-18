import { createElement } from 'test-utils';

import ConstructorGetElementsByClassName from 'x/constructorGetElementsByClassName';

describe('LightningElement.getElementsByClassName', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-get-elements-by-class-name', {
                is: ConstructorGetElementsByClassName,
            });
        }).toThrowErrorDev(
            Error,
            /Assert Violation: this.getElementsByClassName\(\) cannot be called during the construction of the custom element for <x-constructor-get-elements-by-class-name> because no children has been added to this element yet\./
        );
    });
});
