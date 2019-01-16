import { createElement } from 'test-utils';

import Test from 'x/test';

it('should return the parent element when accessing parentNode if it exists', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.inner').parentNode).toBe(
        elm.shadowRoot.querySelector('.outer'),
    );
});

it('should return the shadowRoot when accessing parentNode from an element at the root of the shadow tree', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.outer').parentNode).toBe(elm.shadowRoot);
});

it('should return the right parentElement when node is slotted', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.slotted').parentNode).toBe(
        elm.shadowRoot.querySelector('x-container')
    );
});
