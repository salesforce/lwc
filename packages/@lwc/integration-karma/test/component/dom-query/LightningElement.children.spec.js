import { createElement } from 'lwc';

import ConstructorChildren from 'x/constructorChildren';
import Parent from 'x/parent';

describe('LightningElement.children', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-children', { is: ConstructorChildren });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.children should not be called during the construction of the custom element for <x-constructor-children> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.children;
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot.querySelector('x-child').componentChildren();
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
