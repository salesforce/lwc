import { createElement } from 'lwc';

import ConstructorFirstElementChild from 'x/constructorFirstElementChild';
import Parent from 'x/parent';

describe('LightningElement.firstElementChild', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-child-nodes', { is: ConstructorFirstElementChild });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.firstElementChild should not be called during the construction of the custom element for <x-constructor-child-nodes> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.firstElementChild;
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('x-child').componentFirstElementChild();
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted1');
    });
});
