import { createElement } from 'lwc';

import ShadowDom from 'c/shadow-dom';

describe('ownerDocument', () => {
    it('should return ownerDocument in shadow DOM components', () => {
        const elm = createElement('c-shadow', { is: ShadowDom });
        document.body.appendChild(elm);
        expect(elm.getOwnerDocument()).toEqual(document);
    });
});
