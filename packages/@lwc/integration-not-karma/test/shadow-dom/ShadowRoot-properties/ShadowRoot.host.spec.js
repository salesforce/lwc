import { createElement } from 'lwc';

import Test from 'c/test';

describe('ShadowRoot.host', () => {
    it('should return the shadow tree host element', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.host).toBe(elm);
    });
});
