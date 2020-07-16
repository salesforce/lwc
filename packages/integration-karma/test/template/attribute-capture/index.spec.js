import { createElement } from 'lwc';

import Test from 'x/test';

describe('boolean attribute', () => {
    it('should allow values when is defined as property of a custom element', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('x-child').shadowRoot.textContent).toBe('test-value');
    });
});
