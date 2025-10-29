import { createElement } from 'lwc';

import ConstructorQuerySelector from 'c/constructorQuerySelector';
import Parent from 'c/parent';

describe('LightningElement.querySelector', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-query-selector', { is: ConstructorQuerySelector });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.querySelector\(\) should not be called during the construction of the custom element for <c-constructor-query-selector> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.componentQuerySelector('div');
        expect(parentResult).toBe(null);

        const childResult = elm.shadowRoot.querySelector('c-child').componentQuerySelector('div');
        expect(childResult).not.toBe(null);
        expect(childResult.className).toBe('foo slotted1');
    });
});
