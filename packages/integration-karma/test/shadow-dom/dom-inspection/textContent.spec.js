import { createElement } from 'test-utils';

import Test from 'x/test';

it('should enforce the shadow DOM semantic - x-test', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    expect(elm.shadowRoot.textContent).toBe('Slotted Text');
});

it('should enforce the shadow DOM semantic - x-container', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const container = elm.shadowRoot.querySelector('x-container');
    expect(container.shadowRoot.textContent).toBe('Before[]After');
});
