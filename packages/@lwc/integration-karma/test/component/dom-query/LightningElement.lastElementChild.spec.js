import { createElement } from 'lwc';

import ConstructorLastElementChild from 'x/constructorLastElementChild';
import Parent from 'x/parent';

describe('LightningElement.lastElementChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-child-nodes', { is: ConstructorLastElementChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.lastElementChild should not be called during the construction of the custom element for <x-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.lastElementChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('x-child').componentLastElementChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted2');
    });
});
