import { createElement } from 'lwc';

import ConstructorLastElementChild from 'c/constructorLastElementChild';
import Parent from 'c/parent';

describe('LightningElement.lastElementChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-child-nodes', { is: ConstructorLastElementChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.lastElementChild should not be called during the construction of the custom element for <c-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.lastElementChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('c-child').componentLastElementChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted2');
    });
});
