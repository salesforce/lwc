import { createElement } from 'lwc';

import ConstructorGetElementsByClassName from 'c/constructorGetElementsByClassName';

describe('LightningElement.getElementsByClassName', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-get-elements-by-class-name', {
                is: ConstructorGetElementsByClassName,
            });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.getElementsByClassName\(\) should not be called during the construction of the custom element for <c-constructor-get-elements-by-class-name> because the element is not yet in the DOM or has no children yet\./
        );
    });
});
