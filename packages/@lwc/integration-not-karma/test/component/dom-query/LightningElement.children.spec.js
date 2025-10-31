import { createElement } from 'lwc';

import ConstructorChildren from 'c/constructorChildren';
import Parent from 'c/parent';

describe('LightningElement.children', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-children', { is: ConstructorChildren });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.children should not be called during the construction of the custom element for <c-constructor-children> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.children;
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot.querySelector('c-child').componentChildren();
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
