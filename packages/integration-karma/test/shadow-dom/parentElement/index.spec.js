import { createElement } from 'test-utils';

import Test from 'x/test';

it('should return the parent element if it exists', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.inner').parentElement).toBe(
        elm.shadowRoot.querySelector('.outer'),
    );
});

it('should return null when retrieving parentElement from an element at the root of the shadow tree', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.outer').parentElement).toBe(null);
});

// #958 - Need to fix it first
xit('should return the right parentElement when node is slotted', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.slotted').parentElement).toBe(
        elm.shadowRoot.querySelector('x-container'),
    );
});
