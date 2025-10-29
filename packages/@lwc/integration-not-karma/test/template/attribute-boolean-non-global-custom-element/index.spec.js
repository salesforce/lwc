import { createElement } from 'lwc';

import Test from 'c/test';

describe('boolean attribute', () => {
    it('should allow values when is defined as property of a custom element', () => {
        const elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('c-child').shadowRoot.textContent).toBe('test-value');
    });
});
