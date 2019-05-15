import { createElement } from 'lwc';

import ConstructorQuerySelectorAll from 'x/constructorQuerySelectorAll';
import Parent from 'x/parent';

describe('LightningElement.querySelectorAll', () => {
    it('should throw when invoked in the constructor', () => {
        expect(() => {
            createElement('x-constructor-query-selector-all', { is: ConstructorQuerySelectorAll });
        }).toThrowErrorDev(
            Error,
            /Assert Violation: this.querySelectorAll\(\) cannot be called during the construction of the custom element for <x-constructor-query-selector-all> because no children has been added to this element yet\./
        );
    });

    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const parentResult = elm.componentQuerySelectorAll('div');
        expect(parentResult.length).toBe(0);

        const childResult = elm.shadowRoot
            .querySelector('x-child')
            .componentQuerySelectorAll('div');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
