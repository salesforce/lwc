import { createElement } from 'lwc';

import ConstructorGetElementsByTagName from 'c/constructorGetElementsByTagName';

describe('LightningElement.getElementsByTagName', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-get-elements-by-tag-name', {
                is: ConstructorGetElementsByTagName,
            });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.getElementsByTagName\(\) should not be called during the construction of the custom element for <c-constructor-get-elements-by-tag-name> because the element is not yet in the DOM or has no children yet\./
        );
    });
});
