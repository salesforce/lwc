import { createElement } from 'lwc';

import ParentLightDom from 'c/parentLightDom';

describe('LightningElement.querySelectorAllLightDom', () => {
    it('returns the right elements', () => {
        const elm = createElement('c-parent', { is: ParentLightDom });
        document.body.appendChild(elm);

        const childResult = elm.querySelector('c-child').componentQuerySelectorAll('div');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
