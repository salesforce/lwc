import { createElement } from 'lwc';

import ParentLightDom from 'x/parentLightDom';

describe('LightningElement.querySelectorAllLightDom', () => {
    it('returns the right elements', () => {
        const elm = createElement('x-parent', { is: ParentLightDom });
        document.body.appendChild(elm);

        const childResult = elm.querySelector('x-child').componentQuerySelectorAll('div');
        expect(childResult.length).toBe(2);
        expect(childResult[0].className).toBe('foo slotted1');
        expect(childResult[1].className).toBe('foo slotted2');
    });
});
