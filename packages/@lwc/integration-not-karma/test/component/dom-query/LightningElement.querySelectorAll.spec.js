import { createElement } from 'lwc';

import ConstructorQuerySelectorAll from 'c/constructorQuerySelectorAll';
import Parent from 'c/parent';

describe('LightningElement.querySelectorAll', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('c-constructor-query-selector-all', { is: ConstructorQuerySelectorAll });
        }).toLogErrorDev(
            /Error: \[LWC error]: this.querySelectorAll\(\) should not be called during the construction of the custom element for <c-constructor-query-selector-all> because the element is not yet in the DOM or has no children yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.componentQuerySelectorAll('div');
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot
            .querySelector('c-child')
            .componentQuerySelectorAll('div');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
