import { createElement } from 'lwc';

import ShadowDom from 'x/shadow-dom';

describe('ownerDocument', () => {
    it('should return ownerDocument in shadow DOM components', () => {
        const elm = createElement('x-shadow', { is: ShadowDom });
        document.body.appendChild(elm);
        expect(elm.getOwnerDocument()).toEqual(document);
    });
});
