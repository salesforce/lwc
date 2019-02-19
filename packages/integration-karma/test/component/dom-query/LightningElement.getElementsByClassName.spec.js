import { createElement } from 'test-utils';

import ConstructorGetElementsByClassName from 'x/constructorGetElementsByClassName';
import Parent from 'x/parent';

describe('LightningElement.getElementsByClassName', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-get-elements-by-class-name', {
                is: ConstructorGetElementsByClassName,
            });
        }).toThrowError(
            Error,
            /Assert Violation: this.getElementsByClassName\(\) cannot be called during the construction of the custom element for <x-constructor-get-elements-by-class-name> because no children has been added to this element yet\./,
        );
    });

    // TODO - #1026 LightningElement.getElementsByClassName doesn't respect the shadow DOM
    xit('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.getElementsByClassName('foo');
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot.querySelector('x-child').getElementsByClassName('foo');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
